import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import util


def create_user(username: str, password: str):
    with DbSession() as db:
        dbm = dm.User()
        dbm.username = username
        dbm.hashed_password = util.get_password_hash(password)
        dbm.enabled = True
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_user_by_name(username: str):
    with DbSession() as db:
        return db.query(dm.User).filter(dm.User.username == username).first()


def get_user_list():
    with DbSession() as db:
        return db.query(dm.User).all()
