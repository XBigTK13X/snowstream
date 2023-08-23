import db_models as dm
import api_models as am
from database import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_schedule(schedule: dict):
    with DbSession() as db:
        dbm = dm.StreamableSchedule(**schedule)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_schedules_list():
    with DbSession() as db:
        return db.query(dm.StreamableSchedule).all()


def get_schedule_by_timeslot(channel_id, start_timestamp, stop_timestamp):
    with DbSession() as db:
        return db.query(dm.StreamableSchedule).filter(dm.StreamableSchedule.channel_id == channel_id, dm.StreamableSchedule.start_timestamp == start_timestamp, dm.StreamableSchedule.stop_timestamp == stop_timestamp).first()
