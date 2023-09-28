from log import log
from fastapi import HTTPException
from fastapi.responses import PlainTextResponse
from fastapi import Response

import api_models as am
from db import db
import message.write
import cache

from transcode import transcode


def register(router):

    @router.get("/heartbeat")
    def heartbeat():
        return {
            'alive': True
        }

    @router.get("/stream/source/list")
    def get_stream_source_list():
        return db.op.get_stream_source_list()

    @router.put("/stream/source")
    def create_stream_source(stream_source: am.StreamSource):
        db_source = db.op.get_stream_source_by_url(url=stream_source.url)
        if db_source:
            raise HTTPException(status_code=400, detail="URL already tracked")
        return db.op.create_stream_source(stream_source=stream_source)

    @router.put("/job")
    def create_job(kind: am.Kind):
        job = db.op.create_job(kind=kind.name)
        message.write.send(job_id=job.id, kind=kind.name)
        return job

    @router.get("/job")
    def get_job(job_id: int):
        return db.op.get_job_by_id(job_id=job_id)

    @router.get("/job/list")
    def get_job_list():
        return db.op.get_job_list()

    @router.get('/streamable.m3u', response_class=PlainTextResponse)
    def get_streamable_m3u():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_M3U)

    @router.get('/streamable.xml', response_class=PlainTextResponse)
    def get_streamable_epg():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_EPG)

    # TODO It would be neat if I had a little placeholder video here to let the video player show that the stream is getting ready
    @router.get('/streamable/transcode')
    def get_streamable_transcode(streamable_id: int):
        if not transcode.is_open(streamable_id=streamable_id):
            streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
            transcode_url = transcode.open(streamable)
            log.info(transcode_url)
        playlist = transcode.get_playlist(streamable_id=streamable_id)
        return Response(playlist, status_code=200, media_type="video/mp4")

    @router.get('/streamable/transcode/segment')
    def get_streamable_transcode_segment(streamable_id: int, segment_file: str):
        segment = transcode.get_segment(streamable_id=streamable_id, segment_file=segment_file)
        return Response(segment, status_code=200, media_type="video/mp4")

    @router.delete('/streamable/transcode')
    def delete_streamable_transcode(streamable_id):
        transcode.close(streamable_id=streamable_id)
        return True

    return router
