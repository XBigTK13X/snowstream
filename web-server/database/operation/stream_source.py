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


def get_stream_source_list(ticket:dm.Ticket=None,streamables:bool=False):
    with DbSession() as db:
        query = (
            db.query(dm.StreamSource)
        )
        if ticket.has_stream_source_restrictions():
            query = query.filter(dm.StreamSource.id.in_(ticket.stream_source_ids))
        if ticket.has_tag_restrictions():
            query = query.options(sorm.joinedload(dm.StreamSource.tags))
        if streamables:
            query = query.options(
                sorm.joinedload(dm.StreamSource.streamables)
            )
        stream_sources = query.all()
        results = []
        for stream_source in stream_sources:
            if not ticket.is_allowed(tag_provider=stream_source.get_tag_ids):
                continue
            results.append(stream_source)
        return results

def get_stream_source_by_id(ticket:dm.Ticket,stream_source_id: int):
    with DbSession() as db:
        stream_source = (
            db.query(dm.StreamSource)
            .options(sorm.joinedload(dm.StreamSource.streamables))
            .options(sorm.joinedload(dm.StreamSource.tags))
            .filter(dm.StreamSource.id == stream_source_id)
            .first()
        )
        if not ticket.is_allowed(tag_provider=stream_source.get_tag_ids):
            return None
        stream_source.streamables = sorted(stream_source.streamables,key=lambda xx:xx.name)
        return stream_source

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