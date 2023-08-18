from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import DbSession
import api_models as am
import crud

def get_db():
    db = DbSession()
    try:
        yield db
    finally:
        db.close()

def register(router):

    @router.get("/stream/source/list")
    def get_stream_source_list(db: Session = Depends(get_db)):
        return crud.get_stream_source_list(db)

    @router.put("/stream/source")
    def create_stream_source(stream_source: am.StreamSource, db: Session = Depends(get_db)):
        db_source = crud.get_stream_source_by_url(db, url=stream_source.url)
        if db_source:
            raise HTTPException(status_code=400, detail="URL already tracked")
        return crud.create_stream_source(db=db, stream_source=stream_source)

    @router.put("/job")
    def create_job(kind: str, db: Session = Depends(get_db)):
        return crud.create_job(db=db, kind=kind)

    @router.get("/job")
    def get_job(job_id: int, db: Session = Depends(get_db)):
        return crud.get_job_by_id(db=db, job_id=job_id)

    @router.put("/job/message")
    def update_job_message(job_id: int, message: str, db: Session = Depends(get_db)):
        return crud.update_job_log(db=db, job_id=job_id, message=message)

    @router.get("/job/list")
    def get_job_list(db: Session = Depends(get_db)):
        return crud.get_job_list(db=db)

    return router