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
    @router.get("/stream/source/list")
    def get_stream_source_list(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])]):
        return db.op.get_stream_source_list()

    @router.post("/stream/source")
    def create_stream_source(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], stream_source: am.StreamSource):
        db_source = db.op.get_stream_source_by_url(url=stream_source.url)
        if db_source:
            raise HTTPException(status_code=400, detail="URL already tracked")
        return db.op.create_stream_source(stream_source=stream_source)

    @router.post("/job")
    def create_job(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], kind: am.JobKind):
        job = db.op.create_job(kind=kind.name)
        message.write.send(job_id=job.id, kind=kind.name)
        return job

    @router.get("/job")
    def get_job(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], job_id: int):
        return db.op.get_job_by_id(job_id=job_id)

    @router.get("/job/list")
    def get_job_list(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])]):
        return db.op.get_job_list()

    @router.get('/shelf/list')
    def get_shelf_list(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])]):
        return db.op.get_shelf_list()

    @router.get('/shelf')
    def get_shelf(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], shelf_id: int):
        return db.op.get_shelf_by_id(shelf_id=shelf_id)

    @router.post('/shelf')
    def create_shelf(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], shelf: am.Shelf):
        return db.op.create_shelf(shelf=shelf)

    @router.post('/shelf/scan')
    def scan_shelf(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], shelf_id: int):
        pass

    @router.post('/user')
    def create_user(auth_user:Annotated[am.User, Security(get_current_user, scopes=[])], user: am.User):
        return db.op.create_user(user=user)

    return router

def no_auth_required(router):
    @router.get("/heartbeat")
    def heartbeat():
        return {
            'alive': True
        }
    @router.get("/info")
    def info():
        return {
            'serverVersion': config.server_version,
            'serverBuildDate': config.server_build_date
        }
    @router.get('/password/hash')
    def password_hash(password:str):
        return auth.get_password_hash(password)

    @router.get('/streamable.m3u', response_class=PlainTextResponse)
    def get_streamable_m3u():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_M3U)

    @router.get('/streamable.xml', response_class=PlainTextResponse)
    def get_streamable_epg():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_EPG)

    # TODO It would be neat if I had a little placeholder video here to let the video player show that the stream is getting ready
    @router.get('/streamable/transcode')
    @router.head('/streamable/transcode')
    def get_streamable_transcode(streamable_id: int):
        if not transcode.is_open(streamable_id=streamable_id):
            streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
            transcode_url = transcode.open(streamable)
            #DEBUG log.info(transcode_url)
        playlist = transcode.get_playlist(streamable_id=streamable_id)
        return Response(playlist, status_code=200, media_type="video/mp4")

    @router.get('/streamable/transcode/segment')
    @router.head('/streamable/transcode/segment')
    def get_streamable_transcode_segment(streamable_id: int, segment_file: str):
        segment = transcode.get_segment(streamable_id=streamable_id, segment_file=segment_file)
        return Response(segment, status_code=200, media_type="video/mp4")

    @router.get('/streamable/direct', response_class=RedirectResponse)
    @router.head('/streamable/direct', response_class=RedirectResponse)
    def get_streamable_direct(streamable_id: int):
        streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
        #DEBUG log.info(streamable.url)
        return streamable.url

    @router.delete('/streamable/transcode')
    def delete_streamable_transcode(streamable_id):
        transcode.close(streamable_id=streamable_id)
        return True

    @router.get('/user/list')
    def get_user_list():
        users = db.op.get_user_list()
        return {'users':[user.username for user in users]}

    return router