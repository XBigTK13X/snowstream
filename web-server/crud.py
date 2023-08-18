from sqlalchemy.orm import Session

import db_models as dm
import api_models as am

def get_stream_source_list(db: Session):
    return db.query(dm.StreamSource).all()

def get_stream_source_by_url(db: Session, url: str):
    return db.query(dm.StreamSource).filter(dm.StreamSource.url == url).first()

def create_stream_source(db: Session, stream_source: am.StreamSource):
    db_source = dm.StreamSource(**stream_source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source