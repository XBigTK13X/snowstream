from fastapi import HTTPException

import api_models as am
from db import db
import message.write


def register(router):

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

    return router
