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

def update_show_release_year(show_id:int, release_year:int):
    with DbSession() as db:
        show = db.query(dm.Show).filter(dm.Show.id == show_id).first()
        show.release_year = release_year
        db.commit()
        return show

def update_show_remote_metadata_id(show_id:int, remote_metadata_id:int):
    with DbSession() as db:
        show = db.query(dm.Show).filter(dm.Show.id == show_id).first()
        show.remote_metadata_id = remote_metadata_id
        show.remote_metadata_source = 'thetvdb'
        db.commit()
        return show

def get_show_by_name(name: str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.name == name).first()

def get_show_by_id(ticket:dm.Ticket,show_id: int):
    with DbSession() as db:
        show = (
            db.query(dm.Show)
            .filter(dm.Show.id == show_id)
            .options(sorm.joinedload(dm.Show.shelf))
            .options(sorm.joinedload(dm.Show.seasons))
            .options(sorm.joinedload(dm.Show.metadata_files))
            .first()
        )
        if not ticket.is_allowed(shelf_id=show.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=show.get_tag_ids):
            return None
        show = dm.set_primary_images(show)
        return show

def add_show_to_shelf(show_id: int, shelf_id: int):
    with DbSession() as db:
        dbm = dm.ShowShelf()
        dbm.shelf_id = shelf_id
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_list_by_tag_id(ticket:dm.Ticket, tag_id:int):
    if not ticket.is_allowed(tag_id=tag_id):
        return None
    with DbSession() as db:
        shows = (
            db.query(dm.Show)
            .options(sorm.joinedload(dm.Show.shelf))
            .options(sorm.joinedload(dm.Show.tags))
            .options(sorm.joinedload(dm.Show.metadata_files))
            .all()
        )
        results = []
        for show in shows:
            if tag_id in show.get_tag_ids():
                show = dm.set_primary_images(show)
                show.kind = 'show'
                results.append(show)
        return results

def get_show_list_by_shelf(ticket:dm.Ticket,shelf_id: int,search_query:str=None):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return None
    with DbSession() as db:
        query = (
            db.query(dm.Show)
            .join(dm.ShowShelf)
            .filter(dm.ShowShelf.shelf_id == shelf_id)
            .options(sorm.joinedload(dm.Show.shelf))
        )
        if search_query:
            query = query.filter(dm.Show.name.ilike(f'%{search_query}%'))
        if ticket.has_tag_restrictions():
            query = query.options(sorm.joinedload(dm.Show.tags))
        query = (
            query
            .options(sorm.joinedload(dm.Show.image_files))
            .options(sorm.joinedload(dm.Show.metadata_files))
            .order_by(dm.Show.name)
        )
        if search_query:
            query = query.limit(config.search_results_per_shelf_limit)
        shows = query.all()
        results = []
        for show in shows:
            if not ticket.is_allowed(tag_provider=show.get_tag_ids):
                continue
            show = dm.set_primary_images(show)
            show.kind = 'show'
            results.append(show)
        return results

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

def set_show_shelf_watched(ticket:dm.Ticket,shelf_id:int,is_watched:bool=True):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id
        ).delete()
        db.commit()
        if is_watched:
            dbm = dm.Watched()
            dbm.client_device_user_id = ticket.cduid
            dbm.shelf_id = shelf_id
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
            return dbm
        else:
            db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id == ticket.cduid,
                dm.Watched.shelf_id == shelf_id
            ).delete()
            db.commit()

def get_show_shelf_watched(ticket:dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id == None,
            dm.Watched.show_season_id == None,
            dm.Watched.show_episode_id == None
        ).first()
        return False if watched == None else True

def get_partial_shelf_show_list(ticket:dm.Ticket,shelf_id:int,only_watched:bool=True):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        shows = get_show_list_by_shelf(ticket=ticket,shelf_id=shelf_id)
        shelf_watched = get_show_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        if shelf_watched:
            return shows if only_watched else []
        watched_shows = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id != None,
            dm.Watched.show_season_id == None,
            dm.Watched.show_episode_id == None
        ).distinct(dm.Watched.show_id).all()
        watched_ids = [xx.show_id for xx in watched_shows]
        if only_watched:
            return [xx for xx in shows if xx.id in watched_ids]
        return [xx for xx in shows if not xx.id in watched_ids]

def set_show_watched(ticket:dm.Ticket,show_id:int,is_watched:bool=True):
    with DbSession() as db:
        show = get_show_by_id(ticket=ticket,show_id=show_id)
        if not show:
            return False
        shelf_id = show.shelf.id
        if not ticket.is_allowed(shelf_id=shelf_id):
            return False
        shelf_watched = get_show_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        shows = get_show_list_by_shelf(ticket=ticket,shelf_id=shelf_id)
        if is_watched and not shelf_watched:
            watched_shows = db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id.in_(ticket.watch_group),
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.show_id != None,
                dm.Watched.show_season_id == None,
                dm.Watched.show_episode_id == None
            ).distinct(dm.Watched.show_id).all()
            if len(watched_shows) == len(shows) - 1:
                set_show_shelf_watched(ticket=ticket,shelf_id=shelf_id,is_watched=True)
                return True
            else:
                dbm = dm.Watched()
                dbm.client_device_user_id = ticket.cduid
                dbm.shelf_id = shelf_id
                dbm.show_id = show_id
                db.add(dbm)
                db.commit()
                db.refresh(dbm)
                return True
        if not is_watched and shelf_watched:
            set_show_shelf_watched(ticket=ticket,shelf_id=shelf_id,is_watched=False)
            shows_watched = []
            for other_show in shows:
                if other_show.id == show_id:
                    continue
                shows_watched.append({
                    'show_id': other_show.id,
                    'shelf_id': shelf_id,
                    'client_device_user_id': ticket.cduid
                })
            db.bulk_insert_mappings(dm.Watched,shows_watched)
            db.commit()
            return False
        if not is_watched and not shelf_watched:
            db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id.in_(ticket.watch_group),
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.show_id == show_id
            ).delete()
            db.commit()
            return False
    return is_watched

def get_show_watched(ticket:dm.Ticket,show_id:int):
    show = get_show_by_id(ticket=ticket,show_id=show_id)
    if not show:
        return False
    shelf_id = show.shelf.id
    shelf_watched = get_show_shelf_watched(ticket=ticket,shelf_id=shelf_id)
    if shelf_watched:
        return True
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id == show_id,
            dm.Watched.show_season_id == None,
            dm.Watched.show_episode_id == None
        ).first()
        return False if watched == None else True

def get_unknown_show_list(shelf_id:int=None):
    with DbSession() as db:
        query = (
            db.query(dm.Show)
            .options(sorm.joinedload(dm.Show.image_files))
            .options(sorm.joinedload(dm.Show.metadata_files))
        )
        if shelf_id:
            query = query.join(dm.ShowShelf).filter(dm.ShowShelf.shelf_id == shelf_id)
        query = query.filter(dm.Show.remote_metadata_id == None)
        shows = query.all()
        results = []
        for show in shows:
            if not show.image_files or not show.metadata_files:
                results.append(show)
        return results