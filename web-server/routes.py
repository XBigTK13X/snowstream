from log import log
from fastapi.responses import PlainTextResponse
from fastapi import Response, Request
from typing import Annotated
from fastapi import Security
import api_models as am
from db import db
import message.write
import cache
import auth
from auth import get_current_user
from transcode import transcode
from settings import config
import json
import os
import util

def register(router):
    router = no_auth_required(router)
    return auth_required(router)

def auth_required(router):
    @router.get("/auth/check",tags=['User'])
    def auth_check(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return True

    @router.get("/stream/source/list",tags=['Stream Source'])
    def get_stream_source_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        include_streamables:bool=False
    ):
        return db.op.get_stream_source_list(
            ticket=auth_user.ticket,
            streamables=include_streamables
        )

    @router.post("/stream/source",tags=['Stream Source'])
    def save_stream_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        stream_source: am.StreamSource,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_stream_source(stream_source=stream_source)

    @router.delete("/stream/source/{stream_source_id}",tags=['Stream Source'])
    def delete_stream_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        stream_source_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_stream_source_by_id(stream_source_id=stream_source_id)


    @router.get("/stream/source",tags=['Stream Source'])
    def get_stream_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        stream_source_id: int,
    ):
        if not auth_user.ticket.is_allowed(stream_source_id=stream_source_id):
            return None
        return db.op.get_stream_source_by_id(ticket=auth_user.ticket,stream_source_id=stream_source_id)

    @router.get("/streamable",tags=['Stream Source'])
    def get_streamable(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        streamable_id: int,
    ):
        return db.op.get_streamable_by_id(streamable_id=streamable_id)

    @router.post("/job",tags=['Job'])
    def create_job(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        jobRequest: am.JobRequest,
    ):
        job = db.op.create_job(kind=jobRequest.name,input=jobRequest.input)
        message.write.send(job_id=job.id, kind=jobRequest.name, input=jobRequest.input)
        return job

    @router.get("/job",tags=['Job'])
    def get_job(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        job_id: int,
    ):
        return db.op.get_job_by_id(job_id=job_id)

    @router.get("/job/list", tags=['Job'])
    def get_job_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_job_list()

    @router.get('/log/list', tags=['Job'])
    def get_log_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return config.tail_log_paths

    @router.get('/log', tags=['Job'])
    def get_log(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        log_index: int
    ):
        log_path = config.tail_log_paths[log_index]
        with open(log_path,'r') as read_handle:
            return read_handle.read()

    @router.get("/shelf/list",tags=['Shelf'])
    def get_shelf_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_shelf_list(ticket=auth_user.ticket)

    @router.get("/shelf",tags=['Shelf'])
    def get_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
    ):
        if not auth_user.ticket.is_allowed(shelf_id=shelf_id):
            return None
        return db.op.get_shelf_by_id(shelf_id=shelf_id)

    @router.post("/shelf",tags=['Shelf'])
    def save_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf: am.Shelf,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_shelf(shelf=shelf)

    @router.post("/shelf/watched/toggle",tags=['Shelf'])
    def toggle_shelf_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_shelf_id: int=None,
        show_shelf_id: int=None
    ):
        if movie_shelf_id:
            is_watched = db.op.get_movie_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=movie_shelf_id
            )
            db.op.set_movie_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=movie_shelf_id,
                is_watched=not is_watched
            )
            return not is_watched
        if show_shelf_id:
            is_watched = db.op.get_show_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=show_shelf_id
            )
            db.op.set_show_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=show_shelf_id,
                is_watched = not is_watched
            )
            return not is_watched

    @router.post("/shelf/watched",tags=['Shelf'])
    def set_shelf_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_shelf_id: int=None,
        show_shelf_id: int=None,
        is_watched: bool=False
    ):
        if movie_shelf_id:
            return db.op.set_movie_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=movie_shelf_id,
                is_watched=is_watched
            )
        if show_shelf_id:
            return db.op.set_show_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=show_shelf_id,
                is_watched = is_watched
            )


    @router.delete("/shelf/{shelf_id}",tags=['Shelf'])
    def delete_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_shelf_by_id(shelf_id=shelf_id)

    @router.post("/user",tags=['User'])
    def save_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user: am.User,
    ):
        return db.op.upsert_user(user=user)

    @router.get('/user',tags=['User'])
    def get_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user_id: int
    ):
        return db.op.get_user_by_id(user_id=user_id)

    @router.delete("/user/{user_id}",tags=['User'])
    def delete_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_user_by_id(user_id=user_id)

    @router.post('/user/access',tags=['User'])
    def save_user_access(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user_access: am.UserAccess
    ):
        if not auth_user.is_admin():
            return None
        return db.op.save_user_access(user_access=user_access)

    @router.get('/search', tags=['User'])
    def perform_search(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        query:str
    ):
        return db.op.perform_search(ticket=auth_user.ticket,query=query)

    @router.get('/tag',tags=['Tag'])
    def get_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id: int
    ):
        if not auth_user.ticket.is_allowed(tag_id=tag_id):
            return None
        return db.op.get_tag_by_id(tag_id=tag_id)

    @router.get('/tag/list',tags=['Tag'])
    def get_tag_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_tag_list(ticket=auth_user.ticket)

    @router.post('/tag',tags=['Tag'])
    def save_tag(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag: am.Tag
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_tag(tag)

    @router.delete('/tag/{tag_id}',tags=['Tag'])
    def delete_tag(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id:int
    ):
        if not auth_user.is_admin():
            return None
        return db.delete_tag_by_id(tag_id=tag_id)

    @router.get("/playlist/list",tags=['Tag'])
    def get_playlist_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_playlist_list(ticket=auth_user.ticket)

    @router.get("/playlist",tags=['Tag'])
    def get_playlist_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id: int
    ):
        return db.op.get_playlist_by_tag_id(ticket=auth_user.ticket,tag_id=tag_id)


    @router.get("/movie/list",tags=['Movie'])
    def get_movie_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        show_playlisted:bool=True
    ):
        return db.op.get_movie_list_by_shelf(
            ticket=auth_user.ticket,
            shelf_id=shelf_id,
            show_playlisted=show_playlisted
        )

    @router.get("/movie",tags=['Movie'])
    def get_movie_details(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id: int,
    ):
        movie = db.op.get_movie_by_id(ticket=auth_user.ticket,movie_id=movie_id)
        if movie == None:
            return None
        movie.watched = db.op.get_movie_watched(ticket=auth_user.ticket,movie_id=movie_id)
        movie.has_extras = False
        movie.has_versions = False

        for ii in range(0,len(movie.video_files)):
            movie.video_files[ii].tracks = json.loads(movie.video_files[ii].ffprobe_pruned_json)
            movie.video_files[ii].absolute_index = ii
            if 'main_feature' in movie.video_files[ii].kind:
                movie.main_feature_index = ii
            if 'extra' in movie.video_files[ii].kind:
                movie.has_extras = True
                movie.video_files[ii].is_extra = True

            if movie.video_files[ii].version:
                movie.has_versions = True
        return movie

    @router.post("/movie/watched",tags=['Movie'])
    def set_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        status:am.WatchedStatus
    ):
        return db.op.set_movie_watched(
            ticket=auth_user.ticket,
            movie_id=status.movie_id,
            is_watched=status.is_watched
        )

    @router.post("/movie/watched/toggle",tags=['Movie'])
    def toggle_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int
    ):
        is_watched = db.op.get_movie_watched(
            ticket=auth_user.ticket,
            movie_id=movie_id
        )
        db.op.set_movie_watched(
            ticket=auth_user.ticket,
            movie_id=movie_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.post("/movie/watch_count",tags=['Movie'])
    def increase_movie_watch_count(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int
    ):
        return db.op.increase_movie_watch_count(ticket=auth_user.ticket, movie_id=movie_id)

    @router.post("/movie/progress",tags=['Movie'])
    def set_movie_watch_progress(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        watch_progress: am.WatchProgress
    ):
        return db.op.set_movie_watch_progress(ticket=auth_user.ticket,watch_progress=watch_progress)

    @router.get("/show/list",tags=['Show'])
    def get_show_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        show_playlisted:str=True
    ):
        return db.op.get_show_list_by_shelf(
            ticket=auth_user.ticket,
            shelf_id=shelf_id,
            show_playlisted=show_playlisted
        )

    @router.post("/show/watched",tags=['Show'])
    def set_show_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id:int,
        is_watched:bool=True
    ):
        return db.op.set_show_watched(
            ticket=auth_user.ticket,
            show_id=show_id,
            is_watched=is_watched
        )


    @router.post("/show/watched/toggle",tags=['Show'])
    def toggle_show_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id:int
    ):
        is_watched = db.op.get_show_watched(
            ticket=auth_user.ticket,
            show_id=show_id
        )
        db.op.set_show_watched(
            ticket=auth_user.ticket,
            show_id=show_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.get("/show/episode/list", tags=['Show'])
    def get_show_episode_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id: int
    ):
        return db.op.get_show_episode_list(
            ticket=auth_user.ticket,
            show_id=show_id
        )

    @router.get("/show/season/list",tags=['Show'])
    def get_show_season_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id: int
    ):
        return db.op.get_show_season_list_by_show_id(
            ticket=auth_user.ticket,
            show_id=show_id
        )

    @router.post("/show/season/watched",tags=['Show'])
    def set_show_season_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        season_id:int,
        is_watched:bool=True
    ):
        return db.op.set_show_season_watched(
            ticket=auth_user.ticket,
            season_id=season_id,
            is_watched=is_watched
        )

    @router.post("/show/season/watched/toggle",tags=['Show'])
    def toggle_show_season_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        season_id:int
    ):
        is_watched = db.op.get_show_season_watched(
            ticket=auth_user.ticket,
            season_id=season_id
        )
        db.op.set_show_season_watched(
            ticket=auth_user.ticket,
            season_id=season_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.get("/show/season/episode/list",tags=['Show'])
    def get_show_season_episode_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        show_season_id: int
    ):
        return db.op.get_show_episode_list(ticket=auth_user.ticket,shelf_id=shelf_id,show_season_id=show_season_id)

    @router.post("/show/season/episode/watched",tags=['Show'])
    def set_show_episode_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id:int,
        is_watched:bool=True
    ):
        return db.op.set_show_episode_watched(
            ticket=auth_user.ticket,
            episode_id=episode_id,
            is_watched=is_watched
        )

    @router.post("/show/season/episode/watched/toggle",tags=['Show'])
    def toggle_show_episode_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id:int
    ):
        is_watched = db.op.get_show_episode_watched(
            ticket=auth_user.ticket,
            episode_id=episode_id
        )
        db.op.set_show_episode_watched(
            ticket=auth_user.ticket,
            episode_id=episode_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.post("/show/season/episode/watch_count",tags=['Show'])
    def increase_show_episode_watch_count(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_episode_id:int
    ):
        return db.op.increase_show_episode_watch_count(ticket=auth_user.ticket,show_episode_id=show_episode_id)

    @router.get("/show/season/episode",tags=['Show'])
    def get_show_episode_details(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id: int,
    ):
        episode = db.op.get_show_episode_by_id(ticket=auth_user.ticket,episode_id=episode_id)
        if not episode:
            return None
        episode.watched = db.op.get_show_episode_watched(ticket=auth_user.ticket,episode_id=episode_id)
        episode.has_extras = False
        episode.has_versions = False
        for ii in range(0,len(episode.video_files)):
            episode.video_files[ii].tracks = json.loads(episode.video_files[ii].ffprobe_pruned_json)
            episode.video_files[ii].absolute_index = ii
            if episode.video_files[ii].version:
                episode.has_versions = True
        return episode

    @router.post("/show/season/episode/progress",tags=['Show'])
    def set_show_episode_watch_progress(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        watch_progress: am.WatchProgress
    ):
        return db.op.set_show_episode_watch_progress(ticket=auth_user.ticket,watch_progress=watch_progress)


    @router.get('/keepsake/list')
    def get_keepsake_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int
    ):
        return db.op.get_keepsake_list_by_shelf(shelf_id=shelf_id)

    @router.get('/keepsake')
    def get_keepsake(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        keepsake_id: int
    ):
        return db.op.get_keepsake_by_id(keepsake_id=keepsake_id)

    @router.get('/continue/watching',tags=['User'])
    def get_continue_watching_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_continue_watching_list(ticket=auth_user.ticket)

    @router.post("/transcode/session",tags=['User'])
    def create_transcode_session(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        video_file_id:int=None,
        streamable_id:int=None,
        audio_track_index:int=None,
        subtitle_track_index:int=None
    ):
        transcode_session = transcode.create_session(
            cduid=auth_user.cduid,
            video_file_id=video_file_id,
            streamable_id=streamable_id,
            audio_track_index=audio_track_index,
            subtitle_track_index=subtitle_track_index
        )
        return transcode_session

    @router.get("/session/list",tags=['User'])
    def get_session_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        transcodes = db.op.get_transcode_session_list()
        return {
            'transcodes': transcodes
        }

    @router.get("/playing/queue",tags=['User'])
    def get_playing_queue(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id:int=None,
        show_season_id:int=None,
        tag_id:int=None,
        shuffle:bool=False,
        source:str=None
    ):
        return db.op.get_playing_queue(
            ticket=auth_user.ticket,
            show_id=show_id,
            show_season_id=show_season_id,
            tag_id=tag_id,
            shuffle=shuffle,
            source=source
        )

    @router.post('/playing/queue',tags=['User'])
    def update_playing_queue(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        source:str,
        progress:int
    ):
        return db.op.update_playing_queue(ticket=auth_user.ticket,source=source,progress=progress)

    @router.post('/hotfix')
    def deployment_hotfix(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
    ):
         return db.op.fix_image_file_thumbnail_paths()

    return router


def no_auth_required(router):
    @router.get("/heartbeat",tags=['Unauthed'])
    def heartbeat():
        return {"alive": True}

    @router.get("/info",tags=['Unauthed'])
    def info():
        return {
            "serverVersion": config.server_version,
            "serverBuildDate": config.server_build_date,
        }

    @router.get("/password/hash",tags=['Unauthed'])
    def password_hash(password: str):
        return util.get_password_hash(password)


    @router.get("/user/list",tags=['Unauthed'])
    def get_user_list():
        users = db.op.get_user_list()
        results = []
        admin = None
        for user in users:
            user.hashed_password = None
            if user.username == 'admin':
                admin = user
            else:
                results.append(user)
        results.append(admin)

        return results

    @router.get("/streamable.m3u", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_m3u():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_M3U)

    @router.get("/streamable.xml", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_epg():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_EPG)

    @router.get("/transcode/playlist.m3u8",tags=['Unauthed Video'])
    @router.head("/transcode/playlist.m3u8",tags=['Unauthed Video'])
    def get_transcode_playlist(transcode_session_id:int):
        playlist_content = transcode.get_playlist_content(transcode_session_id=transcode_session_id)
        return Response(playlist_content, status_code=200, media_type="video/mp4")

    @router.get("/transcode/segment",tags=['Unauthed Video'])
    @router.head("/transcode/segment",tags=['Unauthed Video'])
    def get_transcode_file_segment(transcode_session_id: int, segment_file: str):
        segment = transcode.get_stream_segment(
            transcode_session_id=transcode_session_id, segment_file=segment_file
        )
        return Response(segment, status_code=200, media_type="video/mp4")

    @router.delete("/transcode/playlist",tags=['Unauthed Video'])
    def delete_transcode_session(transcode_session_id:int,tags=['Unauthed']):
        transcode.close(transcode_session_id=transcode_session_id)
        return True

    async def webhook(kind:str, request:Request):
        headers = dict(request.headers)
        if not 'apikey' in headers or headers['apikey'] != 'scanner':
            return False
        body = await request.json()
        if kind == 'show' and 'series' in body and 'path' in body['series']:
            directory = body['series']['path']
            tvdbid = None
            if 'tvdbId' in body['series'] and body['series']['tvdbId'] != None:
                tvdbid = int(body['series']['tvdbId'])
            show = db.op.get_show_by_directory(directory=directory)
            if not show:
                log.info(f"Did not find any show at [{directory}]")
                return False
            if not show.remote_metadata_id and tvdbid:
                show = db.op.update_show_remote_metadata_id(
                    show_id=show.id,
                    remote_metadata_id=tvdbid,
                    remote_metadata_source="thetvdb"
                )
            input={
                'target_id': show.id,
                'target_kind': 'show',
                'skip_existing': True,
                'update_images': True,
                'update_metadata': True
            }
            scan_job = db.op.create_job(kind='scan_shelves_content',input=input)
            message.write.send(job_id=scan_job.id, kind='scan_shelves_content', input=input)
            if show.remote_metadata_id:
                input['metadata_id'] = show.remote_metadata_id
                media_job = db.op.create_job(kind='update_media_files',input=input)
                message.write.send(job_id=media_job.id, kind='update_media_files', input=input)
            return True
        elif kind == 'movie' and 'movie' in body and 'folderPath' in body['movie']:
            directory = body['movie']['folderPath']
            tmdbid = None
            if 'tmdbId' in body['movie'] and body['movie']['tmdbId'] != None:
                tmdbid = int(body['movie']['tmdbId'])
            movie = db.op.get_movie_by_directory(directory=directory)
            if not movie:
                log.info(f'Did not find any movie at [{directory}]')
                return False
            if not movie.remote_metadata_id and tmdbid:
                movie = db.op.update_movie_remote_metadata_id(
                    movie_id=movie.id,
                    remote_metadata_id=tmdbid,
                    remote_metadata_source="themoviedb"
                )
            input = {
                'target_id': movie.id,
                'target_kind': 'movie',
                'skip_existing': True,
                'update_images': True,
                'update_metadata': True
            }
            scan_job = db.op.create_job(kind='scan_shelves_content',input=input)
            message.write.send(job_id=scan_job.id, kind='scan_shelves_content', input=input)
            if movie.remote_metadata_id:
                input['metadata_id'] = movie.remote_metadata_id
                media_job = db.op.create_job(kind='update_media_files',input=input)
                message.write.send(job_id=media_job.id, kind='update_media_files', input=input)
            return True
        else:
            log.info("Unable to process webhook")
            log.info("Header")
            log.info(json.dumps(headers,indent=4))
            log.info("Body")
            log.info(json.dumps(body,indent=4))
            return False
        return True

    # https://github.com/Sonarr/Sonarr/blob/14e324ee30694ae017a39fd6f66392dc2d104617/src/NzbDrone.Core/Notifications/Webhook/WebhookBase.cs#L32
    @router.post("/hook/sonarr", tags=['Unauthed'])
    async def hook_sonarr(request:Request):
        return await webhook(kind='show', request=request)

    # https://github.com/Radarr/Radarr/blob/159f5df8cca6704fe88da42d2b20d1f39f0b9d59/src/NzbDrone.Core/Notifications/Webhook/WebhookBase.cs#L32
    @router.post("/hook/radarr", tags=['Unauthed'])
    async def hook_radarr(request:Request):
        return await webhook(kind='movie', request=request)

    return router
