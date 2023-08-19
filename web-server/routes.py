from fastapi import HTTPException

import api_models as am
import crud


def register(router):

    @router.get("/stream/source/list")
    def get_stream_source_list():
        return crud.get_stream_source_list()

    @router.put("/stream/source")
    def create_stream_source(stream_source: am.StreamSource):
        db_source = crud.get_stream_source_by_url(url=stream_source.url)
        if db_source:
            raise HTTPException(status_code=400, detail="URL already tracked")
        return crud.create_stream_source(stream_source=stream_source)

    @router.put("/job")
    def create_job(kind: str):
        job = crud.create_job(kind=kind)
        return job

    @router.get("/job")
    def get_job(job_id: int):
        return crud.get_job_by_id(job_id=job_id)

    @router.get("/job/list")
    def get_job_list():
        return crud.get_job_list()

    return router
