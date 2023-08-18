from fastapi import Depends, FastAPI, HTTPException
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

    @router.get("/stream/source")
    def get_stream_source_list(db: Session = Depends(get_db)):
        return crud.get_stream_source_list(db)

    @router.put("/stream/source")
    def create_stream_source(stream_source: am.StreamSource, db: Session = Depends(get_db)):
        db_source = crud.get_stream_source_by_url(db, url=stream_source.url)
        if db_source:
            raise HTTPException(status_code=400, detail="URL already tracked")
        return crud.create_stream_source(db=db, stream_source=stream_source)

    return router