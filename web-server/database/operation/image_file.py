import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_image_file(shelf_id: int, kind: str, file_path: str):
    with DbSession() as db:
        dbm = dm.ImageFile()
        dbm.path = file_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_image_file_by_path(file_path: str):
    with DbSession() as db:
        return db.query(dm.ImageFile).filter(dm.ImageFile.path == file_path).first()


def get_image_files_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.ImageFile).filter(dm.ImageFile.shelf_id == shelf_id)
