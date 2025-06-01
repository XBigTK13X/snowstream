import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import database.operation.shelf as db_shelf
from settings import config


def create_metadata_file(shelf_id: int, kind: str, local_path: str, xml_content:str):
    network_path = ''
    shelf = db_shelf.get_shelf_by_id(shelf_id=shelf_id)
    network_path = ''
    if shelf.network_path:
        network_path = local_path.replace(shelf.local_path,shelf.network_path)
    web_path = config.web_media_url + local_path
    with DbSession() as db:
        dbm = dm.MetadataFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        dbm.xml_content = xml_content
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_metadata_file_by_path(local_path: str):
    with DbSession() as db:
        return (
            db.query(dm.MetadataFile).filter(dm.MetadataFile.local_path == local_path).first()
        )

def get_or_create_metadata_file(shelf_id: int, kind: str, local_path: str):
    metadata_file = get_metadata_file_by_path(local_path=local_path)
    if not metadata_file:
        with open(local_path) as read_handle:
            return create_metadata_file(
                shelf_id=shelf_id,
                kind=kind,
                local_path=local_path,
                xml_content=read_handle.read()
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

def update_metadata_file_content(metadata_file_id:int,xml_content:str):
    with DbSession() as db:
        dbm = db.query(dm.MetadataFile).filter(dm.MetadataFile.id == metadata_file_id).first()
        if not dbm:
            return None
        dbm.xml_content = xml_content
        db.commit()
        return dbm
