from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from database import DbSession
import api_models as am
import crud

# Dependency
def get_db():
    db = DbSession()
    try:
        yield db
    finally:
        db.close()

def register(router):

    @router.get("/iptv/source")
    def get_iptv_source_list(db: Session = Depends(get_db)):
        return crud.get_iptv_source_list(db)

    @router.put("/iptv/source")
    def create_iptv_source(iptv_source: am.IptvSource, db: Session = Depends(get_db)):
        db_source = crud.get_iptv_source_by_url(db, url=iptv_source.url)
        if db_source:
            raise HTTPException(status_code=400, detail="URL already tracked")
        return crud.create_iptv_source(db=db, iptv_source=iptv_source)

    return router