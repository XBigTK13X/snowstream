import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.show as db_show

def create_show_season(show_id: int, season_order_counter: int):
    with DbSession() as db:
        dbm = dm.ShowSeason()
        dbm.season_order_counter = season_order_counter
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_season_by_id(season_id:int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeason)
            .options(sorm.joinedload(dm.ShowSeason.tags))
            .options(sorm.joinedload(dm.ShowSeason.show).joinedload(dm.Show.shelf))
            .filter(dm.ShowSeason.id == season_id)
            .first()
        )

def get_show_season(show_id: int, season_order_counter: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeason)
            .options(sorm.joinedload(dm.ShowSeason.tags))
            .filter(dm.ShowSeason.show_id == show_id)
            .filter(dm.ShowSeason.season_order_counter == season_order_counter)
            .first()
        )

def get_show_season_list_by_shelf(shelf_id:int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeason)
            .options(sorm.joinedload(dm.ShowSeason.show))
            .filter(dm.ShowSeason.show.shelf.id == shelf_id)
            .all()
        )

def get_show_season_list_by_show_id(show_id: int,include_files:bool=False):
    with DbSession() as db:
        query = (
            db.query(dm.ShowSeason)
        )
        if include_files:
            query = (
                query.options(sorm.joinedload(dm.ShowSeason.image_files))
                .options(sorm.joinedload(dm.ShowSeason.metadata_files))
                .options(sorm.joinedload(dm.ShowSeason.tags))                
            )
        seasons = (
            query.filter(dm.ShowSeason.show_id == show_id)
                .order_by(dm.ShowSeason.season_order_counter)
                .all()
        )
        if include_files:
            for season in seasons:
                season.convert_local_paths_to_web_paths(config=config)
        return seasons

def create_show_season_image_file(show_season_id: int, image_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowSeasonImageFile()
        dbm.show_season_id = show_season_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_season_image_file(show_season_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeasonImageFile)
            .filter(dm.ShowSeasonImageFile.show_season_id == show_season_id)
            .filter(dm.ShowSeasonImageFile.image_file_id == image_file_id)
            .first()
        )


def create_show_season_metadata_file(show_season_id: int, metadata_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowSeasonMetadataFile()
        dbm.show_season_id = show_season_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_season_metadata_file(show_season_id: int, metadata_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeasonMetadataFile)
            .filter(dm.ShowSeasonMetadataFile.show_season_id == show_season_id)
            .filter(dm.ShowSeasonMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_season_tag(show_season_id: int, tag_id: int):    
    with DbSession() as db:
        existing = db.query(dm.ShowSeasonTag).filter(
            dm.ShowSeasonTag.show_season_id == show_season_id and dm.ShowSeasonTag.tag_id == tag_id
        ).first()
        if existing:
            return existing
        dbm = dm.ShowSeasonTag()
        dbm.show_season_id = show_season_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_partial_show_season_list(cduid:int,show_id:int,only_watched:bool=True):
    with DbSession() as db:
        seasons = get_show_season_list_by_show_id(show_id=show_id,include_files=True)
        show = db_show.get_show_by_id(show_id=show_id)
        shelf_watched = db_show.get_show_shelf_watched(cduid=cduid,shelf_id=show.shelf.id)        
        if shelf_watched:
            return seasons if only_watched else []
        show_watched = db_show.get_show_watched(cduid=cduid,show_id=show.id)
        if show_watched:
            return seasons if only_watched else []        
        watched_seasons = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == show.shelf.id,
            dm.Watched.show_id == show.id,
            dm.Watched.show_season_id != None,
            dm.Watched.show_episode_id == None
        ).all()
        watched_ids = [xx.show_season_id for xx in watched_seasons]
        if only_watched:
            return [xx for xx in seasons if xx.id in watched_ids]
        return [xx for xx in seasons if not xx.id in watched_ids]

def set_show_season_watched(cduid:int,season_id:int,is_watched:bool=True):
    with DbSession() as db:
        season = get_show_season_by_id(season_id=season_id)
        show = db_show.get_show_by_id(show_id=season.show_id)
        shelf_id = show.shelf.id
        shelf_watched = db_show.get_show_shelf_watched(cduid=cduid,shelf_id=shelf_id)
        show_watched = db_show.get_show_watched(cduid=cduid,show_id=show.id)
        seasons = get_show_season_list_by_show_id(show_id=show.id,include_files=False)
        db.query(dm.Watched).filter(
            dm.Watched.show_season_id == season_id
        ).delete()
        db.commit()
        if is_watched and not shelf_watched and not show_watched:
            watched_seasons = (
                db.query(dm.Watched).filter(
                    dm.Watched.show_id == show.id,
                    dm.Watched.show_season_id != None,
                    dm.Watched.show_episode_id == None
                ).all()
            )
            if len(watched_seasons) == len(seasons) - 1:
                db_show.set_show_watched(cduid=cduid,show_id=show.id,is_watched=True)
                return True
            else:
                dbm = dm.Watched()
                dbm.client_device_user_id = cduid
                dbm.shelf_id = shelf_id
                dbm.show_id = show.id
                dbm.show_season_id = season_id
                db.add(dbm)
                db.commit()
                db.refresh(dbm)                                    
                return True
        if not is_watched:
            if shelf_watched:
                db_show.set_show_shelf_watched(cduid=cduid,shelf_id=shelf_id,is_watched=False)
            if show_watched:
                db_show.set_show_watched(cduid=cduid,show_id=show.id,is_watched=False)
                seasons_watched = []
                for other_season in seasons:
                    if other_season.id == season_id:
                        continue
                    seasons_watched.append({
                        'show_season_id': other_season.id,
                        'show_id': show.id,
                        'shelf_id': shelf_id,
                        'client_device_user_id': cduid
                    })
                db.bulk_insert_mappings(dm.Watched,seasons_watched)
                db.commit()
                return False
    return is_watched

def get_show_season_watched(cduid:int,season_id:int):
    season = get_show_season_by_id(season_id=season_id)
    show_watched = db_show.get_show_watched(cduid=cduid,show_id=season.show.id)
    if show_watched:
        return True    
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == season.show.shelf.id,
            dm.Watched.show_id == season.show.id,
            dm.Watched.show_season_id == season_id,
            dm.Watched.show_episode_id == None
        ).first()
        return False if watched == None else True