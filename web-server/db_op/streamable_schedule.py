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
