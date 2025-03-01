from log import log
from fastapi import HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.responses import RedirectResponse

from fastapi import Response
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


def register(router):
    router = no_auth_required(router)
    return auth_required(router)


def auth_required(router):
    @router.get("/stream/source/list",tags=['Stream Source'])
    def get_stream_source_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        include_streamables:bool=False
    ):
        return db.op.get_stream_source_list(
            streamables=include_streamables,
            restrictions=auth_user.get_stream_source_restrictions()
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
        restrictions = auth_user.get_stream_source_restrictions()
        if restrictions != None and not stream_source_id in restrictions:
            return None
        return db.op.get_stream_source(stream_source_id=stream_source_id)

    @router.get("/streamable",tags=['Stream Source'])
    def get_streamable(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        streamable_id: int,
    ):
        return db.op.get_streamable_by_id(streamable_id=streamable_id)

    @router.post("/job",tags=['Job'])
    def create_job(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        kind: am.JobKind,
    ):
        job = db.op.create_job(kind=kind.name)
        message.write.send(job_id=job.id, kind=kind.name)
        return job

    @router.get("/job",tags=['Job'])
    def get_job(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        job_id: int,
    ):
        return db.op.get_job_by_id(job_id=job_id)

    @router.get("/job/list",tags=['Job'])
    def get_job_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_job_list()

    @router.get("/shelf/list",tags=['Shelf'])
    def get_shelf_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_shelf_list(auth_user.get_shelf_restrictions())

    @router.get("/shelf",tags=['Shelf'])
    def get_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
    ):
        restrictions = auth_user.get_shelf_restrictions()
        if restrictions != None and not shelf_id in restrictions:
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

    @router.post("/shelf/watched/toggle")
    def toggle_shelf_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_shelf_id: int=None,
        show_shelf_id: int=None
    ):
        if movie_shelf_id:
            is_watched = db.op.get_movie_shelf_watched(
                cduid=auth_user.client_device_user_id,
                shelf_id=movie_shelf_id
            )
            db.op.set_movie_shelf_watched(
                cduid=auth_user.client_device_user_id,
                shelf_id=movie_shelf_id,
                is_watched=not is_watched
            )
            return not is_watched
        if show_shelf_id:
            # TODO Implement
            pass

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
        user_id: int, include_access: bool = False
    ):
        return db.op.get_user_by_id(user_id=user_id, include_access=include_access)

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

    @router.get('/tag',tags=['Tag'])
    def get_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id: int
    ):
        restrictions = auth_user.get_tag_restrictions()
        if restrictions != None and not tag_id in restrictions:
            return None
        return db.op.get_tag_by_id(tag_id=tag_id)

    @router.get('/tag/list',tags=['Tag'])
    def get_tag_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_tag_list(auth_user.get_tag_restrictions())

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

    @router.get("/auth/check",tags=['User'])
    def auth_check(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return True

    @router.get("/movie/list",tags=['Movie'])
    def get_movie_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        watched_status:str=None
    ):
        if watched_status == 'All' or watched_status == None:
            return db.op.get_movie_list_by_shelf(shelf_id=shelf_id)
        return db.op.get_partial_shelf_movie_list(
            cduid=auth_user.client_device_user_id,
            shelf_id=shelf_id,
            only_watched=True if watched_status == 'Watched' else False
        )

    @router.get("/movie",tags=['Movie'])
    def get_movie_details(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id: int,
    ):
        movie = db.op.get_movie_details_by_id(movie_id=movie_id)
        movie.watched = db.op.get_movie_watched(cduid=auth_user.client_device_user_id,movie_id=movie_id)
        return movie

    @router.post("/movie/watched")
    def set_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        status:am.WatchedStatus
    ):
        return db.op.set_movie_watched(
            cduid=auth_user.client_device_user_id,
            movie_id=status.movie_id,
            is_watched=status.is_watched
        )

    @router.post("/movie/watched/toggle")
    def toggle_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int
    ):
        is_watched = db.op.get_movie_watched(
            cduid=auth_user.client_device_user_id,
            movie_id=movie_id
        )
        db.op.set_movie_watched(
            cduid=auth_user.client_device_user_id,
            movie_id=movie_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.get("/show/list",tags=['Show'])
    def get_show_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        watched_status:str=None
    ):
        if watched_status == 'All' or watched_status == None:
            return db.op.get_show_list_by_shelf(shelf_id=shelf_id,include_files=True)
        return db.op.get_partial_shelf_show_list(
            cduid=auth_user.client_device_user_id,
            shelf_id=shelf_id,
            only_watched=watched_status
        )        

    @router.post("/movie/watched/toggle")
    def toggle_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int
    ):
        is_watched = db.op.get_movie_watched(
            cduid=auth_user.client_device_user_id,
            movie_id=movie_id
        )
        db.op.set_movie_watched(
            cduid=auth_user.client_device_user_id,
            movie_id=movie_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.get("/show/season/list",tags=['Show'])
    def get_show_season_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id: int,
    ):
        seasons = db.op.get_show_season_list(show_id=show_id,include_files=True)
        watch_status = db.op.get_show_watch_status(cduid=auth_user.client_device_user_id,show_id=show_id)
        return {
            'seasons':seasons,
            'watch_status':watch_status
        }

    @router.get("/show/season/episode/list",tags=['Show'])
    def get_show_season_episode_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_season_id: int,
    ):
        episodes = db.op.get_show_season_episode_list(show_season_id=show_season_id,include_files=True)
        watch_status = db.op.get_show_season_watch_status(cduid=auth_user.client_device_user_id,season_id=show_season_id)
        return {
            'episodes':episodes,
            'watch_status': watch_status
        }

    @router.get("/show/season/episode",tags=['Show'])
    def get_show_episode_details(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id: int,
    ):
        episode = db.op.get_show_episode_details_by_id(episode_id=episode_id)
        episode.watched = db.op.get_show_episode_watch_status(cduid=auth_user.client_device_user_id,episode_id=episode_id)
        return episode

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
        return auth.get_password_hash(password)


    @router.get("/user/list",tags=['Unauthed'])
    def get_user_list():
        users = db.op.get_user_list()
        for user in users:
            user.hashed_password = None
        return users    

    @router.get("/streamable.m3u", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_m3u():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_M3U)

    @router.get("/streamable.xml", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_epg():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_EPG)

    # TODO It would be neat if I had a little placeholder video here to let the video player show that the stream is getting ready
    @router.get("/streamable/transcode",tags=['Unauthed Video'])
    @router.head("/streamable/transcode",tags=['Unauthed Video'])
    def get_streamable_transcode(streamable_id: int):
        if not transcode.is_open(streamable_id=streamable_id):
            streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
            transcode_url = transcode.open_streamable(streamable=streamable)
            # DEBUG log.info(transcode_url)
        playlist = transcode.get_playlist(streamable_id=streamable_id)
        return Response(playlist, status_code=200, media_type="video/mp4")

    @router.get("/streamable/transcode/segment",tags=['Unauthed Video'])
    @router.head("/streamable/transcode/segment",tags=['Unauthed Video'])
    def get_streamable_transcode_segment(streamable_id: int, segment_file: str):
        segment = transcode.get_segment(
            streamable_id=streamable_id, segment_file=segment_file
        )
        return Response(segment, status_code=200, media_type="video/mp4")

    @router.get("/streamable/direct", response_class=RedirectResponse,tags=['Unauthed Video'])
    @router.head("/streamable/direct", response_class=RedirectResponse,tags=['Unauthed Video'])
    def get_streamable_direct(streamable_id: int):
        streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
        # DEBUG log.info(streamable.url)
        return streamable.url

    @router.delete("/streamable/transcode",tags=['Unauthed Video'])
    def delete_streamable_transcode(streamable_id,tags=['Unauthed Video']):
        transcode.close(streamable_id=streamable_id)
        return True

    @router.get("/video/transcode",tags=['Unauthed Video'])
    @router.head("/video/transcode",tags=['Unauthed Video'])
    def get_video_file_transcode(video_file_id: int):
        if not transcode.is_open(video_file_id=video_file_id):
            video_file = db.op.get_video_file_by_id(video_file_id=video_file_id)
            transcode_url = transcode.open_video_file(video_file=video_file)
            # DEBUG log.info(transcode_url)
        playlist = transcode.get_playlist(video_file_id=video_file_id)
        return Response(playlist, status_code=200, media_type="video/mp4")

    @router.get("/video/transcode/segment",tags=['Unauthed Video'])
    @router.head("/video/transcode/segment",tags=['Unauthed Video'])
    def get_video_file_transcode_segment(video_file_id: int, segment_file: str):
        segment = transcode.get_segment(
            video_file_id=video_file_id, segment_file=segment_file
        )
        return Response(segment, status_code=200, media_type="video/mp4")

    @router.delete("/video/transcode",tags=['Unauthed Video'])
    def delete_video_file_transcode(video_file_id:int,tags=['Unauthed']):
        transcode.close(video_file_id=video_file_id)
        return True

    return router
