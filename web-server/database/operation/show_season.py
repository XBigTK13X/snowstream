import util
import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.show as db_show

def create_show_season(show_id: int, season_order_counter: int, directory: str):
    with DbSession() as db:
        dbm = dm.ShowSeason()
        dbm.season_order_counter = season_order_counter
        dbm.show_id = show_id
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_season_by_id(ticket:dm.Ticket,season_id:int):
    with DbSession() as db:
        query = (
            db.query(dm.ShowSeason)
            .filter(dm.ShowSeason.id == season_id)
            .options(sorm.joinedload(dm.ShowSeason.metadata_files))
        )
        if ticket.has_tag_restrictions():
            query = query.options(sorm.joinedload(dm.ShowSeason.tags))
        show_season = query.first()
        if not show_season:
            return None
        if not ticket.is_allowed(shelf_id=show_season.show.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
            return None
        return show_season

def get_show_season_by_show_and_order(show_id: int, season_order_counter: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeason)
            .options(sorm.joinedload(dm.ShowSeason.tags))
            .filter(dm.ShowSeason.show_id == show_id)
            .filter(dm.ShowSeason.season_order_counter == season_order_counter)
            .first()
        )

def get_show_season_list_by_shelf(ticket:dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        query = db.query(dm.ShowSeason).filter(dm.ShowShelf == shelf_id)
        if ticket.has_tag_restrictions():
            query = query.options(sorm.joinedload(dm.ShowSeason.tags))
        query = query.options(sorm.joinedload(dm.ShowSeason.image_files))
        query = query.options(sorm.joinedload(dm.ShowSeason.metadata_files))
        show_seasons = query.all()
        results = []
        for show_season in show_seasons:
            if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
                continue
            results.append(dm.set_primary_images(show_season))
        return results

def get_show_season_list_by_show_id(ticket:dm.Ticket,show_id: int):
    show = db_show.get_show_by_id(ticket=ticket,show_id=show_id)
    if not show:
        return None
    with DbSession() as db:
        query = (
            db.query(dm.ShowSeason)
            .options(
                sorm.joinedload(dm.ShowSeason.show)
                .joinedload(dm.Show.shelf)
            )
            .filter(dm.ShowSeason.show_id == show_id)
        )
        query = (
            query.options(sorm.joinedload(dm.ShowSeason.image_files))
            .options(sorm.joinedload(dm.ShowSeason.metadata_files))
        )
        show_seasons = (
            query
                .order_by(dm.ShowSeason.season_order_counter)
                .all()
        )

        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == show.shelf.id,
            dm.Watched.show_id == show.id,
            dm.Watched.show_episode_id == None
        ).distinct(dm.Watched.show_season_id).all()
        all_watched = False
        watch_lookup = {}
        for watch in watched:
            if watch.show_season_id == None:
                all_watched = True
                break
            watch_lookup[watch.show_season_id] = True

        results = []
        for show_season in show_seasons:
            if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
                continue
            season = dm.set_primary_images(show_season)
            if not season.poster_image:
                season.poster_image = show.poster_image
                season.screencap_image = show.screencap_image
            season.name = util.get_season_title(season)
            if all_watched or show_season.id in watch_lookup:
                season.watched = True
            else:
                season.watched = False
            results.append(season)
        return results

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
            dm.ShowSeasonTag.show_season_id == show_season_id,
            dm.ShowSeasonTag.tag_id == tag_id
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

def set_show_season_watched(ticket:dm.Ticket,season_id:int,is_watched:bool=True):
    with DbSession() as db:
        season = get_show_season_by_id(ticket=ticket,season_id=season_id)
        if not season:
            return False
        show = db_show.get_show_by_id(ticket=ticket,show_id=season.show_id)
        if not show:
            return False
        seasons = get_show_season_list_by_show_id(ticket=ticket,show_id=show.id)
        if not seasons:
            return False
        shelf_id = show.shelf.id
        shelf_watched = db_show.get_show_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        show_watched = db_show.get_show_watched(ticket=ticket,show_id=show.id)
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id == show.id,
            dm.Watched.show_season_id == season_id
        ).delete()
        db.commit()
        if is_watched and not show_watched:
            watched_seasons = [xx for xx in seasons if xx.watched]
            if len(watched_seasons) == len(seasons) - 1:
                db_show.set_show_watched(ticket=ticket,show_id=show.id,is_watched=True)
                return True
            else:
                dbm = dm.Watched()
                dbm.client_device_user_id = ticket.cduid
                dbm.shelf_id = shelf_id
                dbm.show_id = show.id
                dbm.show_season_id = season_id
                db.add(dbm)
                db.commit()
                db.refresh(dbm)
                return True
        if not is_watched and show_watched:
            db_show.set_show_watched(ticket=ticket,show_id=show.id,is_watched=False)
            seasons_watched = []
            for other_season in seasons:
                if other_season.id == season_id:
                    continue
                seasons_watched.append({
                    'show_season_id': other_season.id,
                    'show_id': show.id,
                    'shelf_id': shelf_id,
                    'client_device_user_id': ticket.cduid
                })
            db.bulk_insert_mappings(dm.Watched,seasons_watched)
            db.commit()
            return False
    return is_watched

def get_show_season_watched(ticket:dm.Ticket,season_id:int):
    season = get_show_season_by_id(ticket=ticket,season_id=season_id)
    if not season:
        return False
    show_watched = db_show.get_show_watched(ticket=ticket,show_id=season.show.id)
    if show_watched:
        return True
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == season.show.shelf.id,
            dm.Watched.show_id == season.show.id,
            dm.Watched.show_season_id == season_id,
            dm.Watched.show_episode_id == None
        ).first()
        return False if watched == None else True