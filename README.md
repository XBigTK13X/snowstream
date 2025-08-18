# snowstream

Snowman's streaming solution

Open Source all in one self-hosted media streaming solution.

# Motivation

There is a large swath of projects that work together to provide a media streaming setup. However, customizing them can be daunting since the tools are so fragmented. I initially started snowstream because I needed to customize Jellyfin and half a dozen other programs to acheive the feature set I was looking for. This included at least 6 different languages and project structures. I just wanted something simpler.

# Feature development progress

Check the [progress tracker on the WIKI](https://github.com/XBigTK13X/snowstream/wiki/Feature-Progress-Tracker) during the early days of this project. Eventually this will move to issues/projects.

## Why not use X?

Before I list these out, let me say that I have the upmost respect for each of the teams maintaining these projects. These pieces of software didn't fit my workflow, but are great on their own. If it isn't listed here then it was either abandonware or I just didn't know about it.

| Software  | Functionality    | Reason                                                                                                                                                                                                                                                                                   |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Threadfin | IPTV             | UI is incredibly buggy. Lots of changes get lost. Obtuse behaviors leading to channels getting disabled. Unexpected CPU spikes                                                                                                                                                           |
| ErsatzTV  | PseudoTV         | Convulated workflow to eventually get streaming URLs. Project structure is difficult to develop on Linux. Another CPU spike source.                                                                                                                                                      |
| guide2go  | Schedules Direct | Mostly worked great. However, the CLI just dumps a bunch of files and you need to map them to containers. I just wanted a simple API to get the EPG data.                                                                                                                                |
| Plex      | Streaming        | Closed Source                                                                                                                                                                                                                                                                            |
| Emby      | Streaming        | Closed Source and fragile. It seemed like every stable release broke my library in new and exciting ways                                                                                                                                                                                 |
| Jellyfin  | Streaming        | Well supported by the community, but inherited a lot of Emby's technical debt. Also introduced strange bugs in my library over each release. I made around a dozen patches to various Jellyfin projects before deciding it was too messy to bother contributing. Eats RAM for breakfast. |

# Developing Locally

Create a script `script/variables.sh` with something like the following.

```
#! /bin/bash

source web-server/venv/bin/activate

export SNOWSTREAM_WEB_MEDIA_URL="http://<your-dev-machine-ip>:9064/media"
export SNOWSTREAM_WEB_API_URL="http://<your-dev-machine-ip>:8000"

```

`source script/variables.sh` at the start of any work session.

Use the `script/dev-docker-services.sh` bash script to launch a dockerized version of the app. This is used for postgres, rabbit, and any other services required to run snowstream.

Note that network shares do not mount properly inside docker. If you want media files to develop against, then put them in a path on your local machine under `.web-media/shows` or `.web-media/movies` from the repo root.

Run `script/dev-run-all.sh` to launch the dev/debug versions of the app.

To develop the mobile app, make sure you have an Android emulator or physical debug connected via adb.

Then `cd expo` and run `npx expo start`. This will run a local debug version of the app on the Android target. This is required due to the use of `libmpv`.

During first time setup, you may need to create a virtualenv under `web-server` and run `npx yarn install` under the `expo` dir.

# Creating an Android TV APK

Update any needed settings in beast's docker script.

For a single APK test,

Run `script/prod-generate-apks.sh`

<a class="thetvdbattribution" style="" href="https://thetvdb.com/subscribe">
    <img src="/images/attribution/logo1.png" height="45">
    Metadata provided by TheTVDB. Please consider adding missing information or subscribing.
</a>

Otherwise use,

`~/script/full-snowstream-release.sh`

# Escape the dreaded Android emulator pinch to zoom

Double click the magnifying glass twice on the external controls.

# Upgrade the container postgres version

1. `ssh` into beast
2. Make sure the snowstream container is running the previous postgres version
3. Generate a full backup
    - `docker exec snowstream pg_dumpall -U snowstream > volume/snowstream/pg-upgrade/15-to-17.sql`
4. Kill the snowstream container
    - `docker rm -f snowstream`
5. Backup the previous postgres dir
    - `mv volume/snowstream/postgresql volume/snowstream/bup-postgres=15`
6. Switch snowstream to the new container version, and run it
7. After the new empty postgres db is ready, ensure the snowstream bootstrapping is deleted
    - `docker exec -it snowstream bash`
    - `psql -U snowstream`
    - `DO $$ DECLARE r record; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public') LOOP EXECUTE 'DROP TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END $$;`
    - `exit`
8. Restore the backup into the now empty db
    - `cat volume/snowstream/pg-upgrade/15-to-17.sql | docker exec -i snowstream psql -U snowstream`

