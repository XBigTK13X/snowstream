import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config


def create_show(name: str, directory: str):
    with DbSession() as db:
        dbm = dm.Show()
        dbm.name = name
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_by_name(name: str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.name == name).first()

def get_show_by_id(show_id: int):
    with DbSession() as db:
        return (
            db.query(dm.Show)
            .options(sorm.joinedload(dm.Show.shelf))
            .filter(dm.Show.id == show_id)
            .first()
        )

def add_show_to_shelf(show_id: int, shelf_id: int):
    with DbSession() as db:
        dbm = dm.ShowShelf()
        dbm.shelf_id = shelf_id
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_list_by_shelf(shelf_id: int,include_files:bool=True):
    with DbSession() as db:
        query = db.query(dm.Show)
        if include_files:
            query = (
                query.options(sorm.joinedload(dm.Show.shelf))
                .options(sorm.joinedload(dm.Show.image_files))
                .options(sorm.joinedload(dm.Show.metadata_files))
                .options(sorm.joinedload(dm.Show.tags))
            )
        shows = (
            query
            .order_by(dm.Show.name)
            .all()
        )
        for show in shows:
            show.convert_local_paths_to_web_paths(config=config)
        return shows






def create_show_image_file(show_id: int, image_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowImageFile()
        dbm.show_id = show_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_image_file(show_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowImageFile)
            .filter(dm.ShowImageFile.show_id == show_id)
            .filter(dm.ShowImageFile.image_file_id == image_file_id)
            .first()
        )


def create_show_metadata_file(show_id: int, metadata_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowMetadataFile()
        dbm.show_id = show_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_metadata_file(show_id: int, metadata_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowMetadataFile)
            .filter(dm.ShowMetadataFile.show_id == show_id)
            .filter(dm.ShowMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_tag(show_id: int, tag_id: int):    
    with DbSession() as db:
        existing = db.query(dm.ShowTag).filter(dm.ShowTag.show_id == show_id and dm.ShowTag.tag_id == tag_id).first()
        if existing:
            return existing
        dbm = dm.ShowTag()
        dbm.show_id = show_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_show_shelf_watched(cduid:int,shelf_id:int,is_watched:bool=True):
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id
        ).delete()
        db.commit()
        if is_watched:            
            dbm = dm.Watched()
            dbm.client_device_user_id = cduid
            dbm.shelf_id = shelf_id            
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
            return dbm
        else:
            db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id
            ).delete()            
            db.commit()

def get_show_shelf_watched(cduid:int,shelf_id:int):
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id == None,
            dm.Watched.show_season_id == None,
            dm.Watched.show_episode_id == None
        ).first()
        return False if watched == None else True

def get_partial_shelf_show_list(cduid:int,shelf_id:int,only_watched:bool=True):
    with DbSession() as db:
        shows = get_show_list_by_shelf(shelf_id=shelf_id,include_files=False)
        shelf_watched = get_show_shelf_watched(cduid=cduid,shelf_id=shelf_id)
        if shelf_watched:
            return shows if only_watched else []
        watched_shows = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id != None,
            dm.Watched.show_season_id == None,
            dm.Watched.show_episode_id == None
        ).all()
        watched_ids = [xx.show_id for xx in watched_shows]
        if only_watched:
            return [xx for xx in shows if xx.id in watched_ids]
        return [xx for xx in shows if not xx.id in watched_ids]

def set_show_watched(cduid:int,show_id:int,is_watched:bool=True):
    with DbSession() as db:
        show = get_show_by_id(show_id=show_id)
        shelf_id = show.shelf.id
        shelf_watched = get_show_shelf_watched(cduid=cduid,shelf_id=shelf_id)
        shows = get_show_list_by_shelf(shelf_id=shelf_id)  
        if is_watched and not shelf_watched:
            watched_shows = db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.show_id != None,
                dm.Watched.show_season_id == None,
                dm.Watched.show_episode_id == None
            ).all()
            if len(watched_shows) == len(shows) - 1:
                set_show_shelf_watched(cduid,shelf_id=shelf_id,is_watched=True)
                return True
            else:
                dbm = dm.Watched()
                dbm.client_device_user_id = cduid
                dbm.shelf_id = shelf_id
                dbm.show_id = show_id
                db.add(dbm)
                db.commit()
                db.refresh(dbm)                                    
                return True
        if not is_watched and shelf_watched:
            set_show_shelf_watched(cduid=cduid,shelf_id=shelf_id,is_watched=False)
            shows_watched = []
            for other_show in shows:
                if other_show.id == show_id:
                    continue
                shows_watched.append({
                    'show_id': other_show.id,
                    'shelf_id': shelf_id,
                    'client_device_user_id': cduid
                })
            db.bulk_insert_mappings(dm.Watched,shows_watched)
            db.commit()
            return False
        if not is_watched and not shelf_watched:
            db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.show_id == show_id
            ).delete()          
            db.commit()
            return False
    return is_watched

def get_show_watched(cduid:int,show_id:int):
    show = get_show_by_id(show_id=show_id)
    shelf_id = show.shelf.id
    shelf_watched = get_show_shelf_watched(cduid=cduid,shelf_id=shelf_id)
    if shelf_watched:
        return True
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id == show_id
        ).first()
        return False if watched == None else True