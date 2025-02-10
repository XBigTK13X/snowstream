import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_video_file(shelf_id: int, kind: str, file_path: str):
    with DbSession() as db:
        dbm = dm.VideoFile()
        dbm.path = file_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_video_file_by_path(file_path: str):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.path == file_path).first()

def get_video_file_by_id(video_file_id: int):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.id == video_file_id).first()


def get_video_files_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.shelf_id == shelf_id)

def get_video_files_list():
    with DbSession() as db:
        return db.query(dm.VideoFile).all()