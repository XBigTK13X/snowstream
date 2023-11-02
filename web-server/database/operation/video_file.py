import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_video_file(kind: str, file_path: str):
    with DbSession() as db:
        dbm = dm.VideoFile()
        dbm.path = file_path
        dbm.kind = kind
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_video_file_by_path(file_path: str):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.path == file_path).first()
