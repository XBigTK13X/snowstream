import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_stream_source(stream_source: am.StreamSource):
    with DbSession() as db:
        db_source = dm.StreamSource(**stream_source.model_dump())
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return db_source


def get_stream_source_list(streamables:bool=False,restrictions:list[int]=None):
    with DbSession() as db:
        query = db.query(dm.StreamSource)
        if restrictions != None:
            query = query.filter(dm.StreamSource.id.in_(restrictions))
        if streamables:
            query = query.options(
                sorm.joinedload(dm.StreamSource.streamables)                
            )
        return query.all()

def get_stream_source(stream_source_id: int):
    with DbSession() as db:
        return db.query(dm.StreamSource).options(
            sorm.joinedload(dm.StreamSource.streamables)
        ).filter(dm.StreamSource.id == stream_source_id).first()

def get_stream_source_by_url(url: str):
    with DbSession() as db:
        return db.query(dm.StreamSource).filter(dm.StreamSource.url == url).first()

def upsert_stream_source(stream_source: am.StreamSource):
    existing_stream_source = None
    if stream_source.id:
        existing_stream_source = get_stream_source_by_url(url=stream_source.url)
    if not existing_stream_source:
        return create_stream_source(stream_source)    
    with DbSession() as db:
        existing_stream_source = db.query(dm.StreamSource).filter(dm.StreamSource.id == stream_source.id).update(stream_source.model_dump())
        db.commit()        
        return existing_stream_source


def delete_stream_source_by_id(stream_source_id: str):
    with DbSession() as db:
        deleted = db.query(dm.StreamSource).filter(dm.StreamSource.id == stream_source_id).delete()
        db.commit()
        return deleted