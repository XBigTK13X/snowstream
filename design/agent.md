# snowstream Architecture Overview

`snowstream` is a self-hosted media streaming platform supporting movies, TV shows, personal keepsakes, live/IPTV stream sources, and EPG channel guides.

## Repository Layout

- `web-server/`: Python 3.12+ FastAPI backend, SQLAlchemy/Alembic DB layer, RabbitMQ job worker, and FFmpeg transcoding/media planner.
- `expo/`: React Native (`react-native-tvos` + Expo) client for Android TV, mobile, and Web, built on `@snowsuite/expo-snowui`.
- `docker/`: Container scripts and configs (`supervisord-full.conf`, `nginx.conf`, PostgreSQL, RabbitMQ, Uvicorn).
- `script/`: Local development setup and service scripts (`dev-docker-services.sh`, `dev-first-setup.sh`, `dev-try-api.sh`).
- `design/`: Architecture and schema design notes (see [Design Docs Index](#design-docs-index)).

## Runtime Topology

In production (`Dockerfile`, `docker/supervisord-full.conf`), `supervisord` runs five services:
1. `postgresql`: Primary database (dev default port `9060`).
2. `rabbitmq`: Job queue broker (dev default port `9062`, queue `snowstream`).
3. `nginx`: Serves the built web frontend (`/app/prod-frontend`), proxies `/api` to the FastAPI server, and serves static media/thumbnails from `/mnt/` and `/.snowstream/`.
4. `snowstream-server`: FastAPI app (`web-server/bin/server.py`, port `8000`).
5. `snowstream-worker`: RabbitMQ consumer (`web-server/bin/worker.py`).

Configuration lives in `web-server/settings.py` (`Config` class). Any attribute on `Config` can be overridden via `SNOWSTREAM_<UPPER_KEY>` environment variables. `SNOWSTREAM_WEB_MEDIA_URL` is required on startup.

## Backend (`web-server/`)

### API & Auth
- **Entrypoint**: `web-server/bin/server.py` creates the FastAPI app, configures CORS, registers `auth.register` and `routes.register` under `/api` (Swagger at `/api/docs/swagger`).
- **Auth (`web-server/auth.py`)**: OAuth2 password flow (`POST /api/login`) issuing HS256 JWTs tied to a `ClientDeviceUser` (`cduid`) ticket. Non-admin users on `auth_device_whitelist` devices can authenticate without password verification.
- **Routes (`web-server/routes.py`, `web-server/api_models.py`)**: Covers library browsing (`shelf`, `movie`, `show`, `show/season`, `show/season/episode`, `keepsake`), user activity (`watched`, `watch_count`, `progress`, `continue/watching`, `recently/added`, `playing/queue`, `playlist`), admin/config (`user`, `tag`, `tag-rule`, `display-cleanup-rule`, `cached-text`, `job`, `log`, `hotfix`), live streams (`stream/source`, `streamable`, `channel/guide/source`, `channel`), transcoding (`/transcode/session`, `/transcode/stream`, `/transcode/playlist.m3u8`, `/transcode/segment`), and webhooks (`/hook/sonarr`, `/hook/radarr`).

### Database (`web-server/database/`)
- **Wrapper**: `web-server/db.py` exposes `db.op` (`database/operation/*`), `db.Ticket`, and `db.Stub`.
- **Models (`web-server/database/db_models.py`)**: PostgreSQL via SQLAlchemy 2.0, managed with Alembic (`web-server/database/migration/`).
  - **Library**: `Shelf` -> `Movie` / `Show` -> `ShowSeason` -> `ShowEpisode` / `Keepsake`.
  - **Files**: `VideoFile`, `ImageFile`, `MetadataFile` linked via join tables (e.g., `MovieVideoFile`, `ShowEpisodeImageFile`).
  - **Organization**: `Tag`, `TagRule`, `DisplayCleanupRule`, `PlayingQueue`, `CachedText`.
  - **Live/Streams**: `StreamSource` -> `Streamable` <-> `StreamableChannel` <-> `Channel` <- `ChannelGuideSource` (`ChannelProgram`).
  - **Users & Playback**: `User`, `ClientDevice`, `ClientDeviceUser`, `WatchProgress`, `WatchCount`, `Watched`, `TranscodeSession`, `Job`.

### Background Jobs (`web-server/bin/worker.py`, `web-server/message/`)
- API endpoints create a `Job` record and publish a JSON payload (`job_id`, `kind`, `input`, `auth_user`) via `message/write.py` to RabbitMQ.
- `bin/worker.py` consumes messages, wraps `input` in `JobMediaScope` (`message/job_media_scope.py`), updates `Job` status/messages in Postgres, and dispatches to `message/handler/`:
  - `scan_shelves_content` -> `scan_shelf/{movies_scan,shows_scan,keepsakes_scan}.py`
  - `read_media_files`, `identify_unknown_media`, `update_media_files` -> `update_media/{movie,show,show_season,show_episode}.py` + `provider/{themoviedb,thetvdb}_provider.py`
  - `regen_screencap_thumbnails`, `sanitize_file_properties`, `clean_file_records`, `delete_media_records`, `apply_directory_tag`
  - `stream_sources_refresh` -> `stream_source/{frigate_nvr,hd_home_run,iptv_m3u,tube_archivist}.py`
  - `channel_guide_refresh` -> `channel_guide/{iptv_epg,schedules_direct}.py`

### Media Planning & Transcoding (`web-server/snow_media/`)
- **Playback Planner (`planner.py`, `device.py`)**: `create_plan(device_profile, snowstream_info, video_kind)` evaluates video/audio tracks (HDR10+/Dolby Vision, AV1, HEVC/H264 10-bit, TrueHD/DTS) against device profiles to decide player (`mpv` vs `exo`), decoding mode, passthrough, or transcoding.
- **Transcode Sessions (`transcode_sessions.py`, `transcode_cli.py`, `transcode_dialect/`)**: Allocates a port from `transcode_port_range` (`11910-11950`), builds FFmpeg CLI args using hardware dialects (`default`, `vaapi`, `nvidia`, `quicksync`), and runs FFmpeg as a background process tracked in `TranscodeSession`.

## Frontend (`expo/`)

- **Entry & Shell**: `expo/App.js` -> `expo/src/page/page-loader.js` wraps `SnowApp` (`@snowsuite/expo-snowui`), `AppContextProvider`, and `Player.Manager`.
- **Routing (`expo/src/routes.js`, `expo/src/pages.js`)**:
  - Unauthenticated: `/sign-in`, `/password`.
  - Authenticated with nav header (`/auth/wrap/*`): `landing`, `list/*`, `details/*`, `search`, `recently/added`, `options`, `info`, and `admin/*` management screens.
  - Full-screen playback (`/auth/play/*`): `episode`, `movie`, `keepsake`, `streamable`, `playing-queue`.
- **Context & API (`expo/src/app-context.js`, `expo/src/api-client.js`, `expo/src/settings.js`)**: `AppContextProvider` manages auth state, `ApiClient` (Axios wrapper for `/api`), `clientOptions`, and `navToItem` (routes by `model_kind`). `jsconfig.json` aliases `"snowstream"` to `src/index`.
- **Video Player (`expo/src/player/`, `expo/src/comp/snow-video-player.js`, `expo/src/comp/video/`)**: `resolvePlaybackConfig` in `player-hub.js` selects `web`, `mpv`, `exo` (used for HDR, YouTube, or `forcePlayer === 'exo'`), or `null` view, controlled via `SnowVideoControls` and `Player.Manager`.

## Design Docs Index

Check `design/` for detailed specs on specific subsystems:
- `design/job-workflow.md` and `design/job-descriptions.md`: Job queue lifecycle and handler behavior.
- `design/transcode.md`, `design/playback-experience.md`, `design/device-considerations.md`: Transcoding dialects, player selection, and device profiles.
- `design/updating-media-files.md`, `design/video-file-queries.md`, `design/cascade-delete.md`: Media scanning, file queries, and cascade deletion.
- `design/user-activity-schema.md`, `design/sqlalchemy.md`, `design/channel-guide.md`: Schema conventions and EPG design.
