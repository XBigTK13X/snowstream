import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_channel(channel: dict):
    with DbSession() as db:
        dbm = dm.StreamableChannel(**channel)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_channels_list(schedules=False):
    with DbSession() as db:
        if schedules:
            sql = sa.select(dm.StreamableChannel).options(
                sorm.joinedload(dm.StreamableChannel.schedules)
            )
            return db.scalars(sql).unique().all()
        return db.query(dm.StreamableChannel).all()


def get_channel_by_parsed_id(parsed_id: str):
    with DbSession() as db:
        return (
            db.query(dm.StreamableChannel)
            .filter(dm.StreamableChannel.parsed_id == parsed_id)
            .first()
        )
