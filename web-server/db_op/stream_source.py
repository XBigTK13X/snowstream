import db_models as dm
import api_models as am
from database import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_stream_source(stream_source: am.StreamSource):
    with DbSession() as db:
        db_source = dm.StreamSource(**stream_source.dict())
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return db_source


def get_stream_source_list(streamables=False):
    with DbSession() as db:
        if streamables:
            sql = sa.select(dm.StreamSource).options(sorm.joinedload(dm.StreamSource.streamables))
            return db.scalars(sql).unique().all()
        else:
            return db.query(dm.StreamSource).all()


def get_stream_source_by_url(url: str):
    with DbSession() as db:
        return db.query(dm.StreamSource).filter(dm.StreamSource.url == url).first()


def update_stream_source(id: str, remote_data: str):
    with DbSession() as db:
        db_source = db.query(dm.StreamSource).filter(dm.StreamSource.id == id).first()
        db_source.remote_data = remote_data
        db.commit()
        return db_source
