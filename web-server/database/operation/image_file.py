import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import magick
from settings import config
import os

def create_image_file(shelf_id: int, kind: str, local_path: str, web_path: str, network_path: str,thumbnail_web_path: str):
    with DbSession() as db:
        dbm = dm.ImageFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        dbm.thumbnail_web_path = thumbnail_web_path
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_image_file_by_path(local_path: str):
    with DbSession() as db:
        return db.query(dm.ImageFile).filter(dm.ImageFile.local_path == local_path).first()

def get_or_create_image_file(shelf_id: int, kind: str, local_path: str, web_path: str, network_path: str):
    image_file = get_image_file_by_path(local_path=local_path)
    if not image_file:
        local_thumbnail_path = magick.create_thumbnail(local_path)
        thumbnail_web_path = config.web_media_url + '/mnt/' + local_thumbnail_path
        return create_image_file(
            shelf_id=shelf_id, kind=kind, local_path=local_path, web_path=web_path, network_path=network_path, thumbnail_web_path=thumbnail_web_path
        )
    return image_file

def get_image_files_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.ImageFile).filter(dm.ImageFile.shelf_id == shelf_id)

def get_image_files_list():
    with DbSession() as db:
        return db.query(dm.ImageFile).all()