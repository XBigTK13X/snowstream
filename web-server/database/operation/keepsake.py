import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config

def create_keepsake(directory: str):
    with DbSession() as db:
        dbm = dm.Keepsake()
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def add_keepsake_to_shelf(keepsake_id: int, shelf_id: int):
    with DbSession() as db:
        dbm = dm.KeepsakeShelf()
        dbm.shelf_id = shelf_id
        dbm.keepsake_id = keepsake_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_keepsake_by_directory(directory:str):
    with DbSession() as db:
        return (
            db.query(dm.Keepsake)
            .filter(dm.Keepsake.directory == directory)
            .options(sorm.joinedload(dm.Keepsake.video_files))
            .options(sorm.joinedload(dm.Keepsake.image_files))
            .options(sorm.joinedload(dm.Keepsake.shelf))
            .first()
        )

def get_keepsake_list_by_shelf(shelf_id: int, search_query:str=None):
    with DbSession() as db:
        query = (
            db.query(dm.Keepsake)
            .join(dm.KeepsakeShelf)
            .filter(dm.KeepsakeShelf.shelf_id == shelf_id)
            .options(sorm.joinedload(dm.Keepsake.image_files))
            .options(sorm.joinedload(dm.Keepsake.shelf))
        )
        if search_query:
            query = query.filter(dm.Keepsake.directory.ilike(f'%{search_query}%'))
        query = (
            query.filter(dm.KeepsakeShelf.shelf_id == shelf_id)
            .order_by(dm.Keepsake.directory)
        )
        if search_query:
            query = query.limit(config.search_results_per_shelf_limit)
        keepsakes = query.all()
        results = []
        for keepsake in keepsakes:
            keepsake.kind = 'keepsake'
        return results

def create_keepsake_video_file(keepsake_id: int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.KeepsakeVideoFile()
        dbm.keepsake_id = keepsake_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_keepsake_video_file(keepsake_id: int, video_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.KeepsakeVideoFile)
            .filter(dm.KeepsakeVideoFile.keepsake_id == keepsake_id)
            .filter(dm.KeepsakeVideoFile.video_file_id == video_file_id)
            .first()
        )

def create_keepsake_image_file(keepsake_id: int, image_file_id: int):
    with DbSession() as db:
        dbm = dm.KeepsakeImageFile()
        dbm.keepsake_id = keepsake_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_keepsake_image_file(keepsake_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.KeepsakeImageFile)
            .filter(dm.KeepsakeImageFile.keepsake_id == keepsake_id)
            .filter(dm.KeepsakeImageFile.image_file_id == image_file_id)
            .first()
        )

