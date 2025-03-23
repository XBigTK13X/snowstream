import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_metadata_file(shelf_id: int, kind: str, local_path: str, web_path: str, network_path: str):
    with DbSession() as db:
        dbm = dm.MetadataFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_metadata_file_by_path(local_path: str):
    with DbSession() as db:
        return (
            db.query(dm.MetadataFile).filter(dm.MetadataFile.local_path == local_path).first()
        )

def get_or_create_metadata_file(shelf_id: int, kind: str, local_path: str, web_path: str, network_path: str):
    metadata_file = get_metadata_file_by_path(local_path=local_path)
    if not metadata_file:
        return create_metadata_file(
            shelf_id=shelf_id, kind=kind, local_path=local_path, web_path=web_path, network_path=network_path
        )
    return metadata_file

def get_metadata_files_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.MetadataFile).filter(dm.MetadataFile.shelf_id == shelf_id)

def get_metadata_file_list():
    with DbSession() as db:
        return db.query(dm.MetadataFile).options(
            sorm.joinedload(dm.MetadataFile.movie)
        ).options(
            sorm.joinedload(dm.MetadataFile.show)
        ).options(
            sorm.joinedload(dm.MetadataFile.show_season)
        ).options(
            sorm.joinedload(dm.MetadataFile.show_episode)
        ).all()
