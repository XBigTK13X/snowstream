import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_streamable(stream_source_id: int, url: str, name: str):
    with DbSession() as db:
        dbm = dm.Streamable()
        dbm.name = name
        dbm.url = url
        dbm.stream_source_id = stream_source_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_streamable_by_id(streamable_id: int):
    with DbSession() as db:
        return (
            db.query(dm.Streamable)
            .options(sorm.joinedload(dm.Streamable.stream_source))
            .filter(dm.Streamable.id == streamable_id)
            .first()
        )
