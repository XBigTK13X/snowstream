import database.db_models as dm
from database.sql_alchemy import DbSession
import sqlalchemy.orm as sorm
from sqlalchemy import text as sql_text
from settings import config
import database.operation.show_episode as db_episode
import database.operation.show_season as db_season

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

def update_show_remote_metadata_id(show_id:int, remote_metadata_id:int, remote_metadata_source:str='thetvdb'):
    with DbSession() as db:
        show = db.query(dm.Show).filter(dm.Show.id == show_id).first()
        show.remote_metadata_id = remote_metadata_id
        show.remote_metadata_source = remote_metadata_source
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

def get_show_by_directory(directory:str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.directory == directory).first()

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
                results.append(show)
        return results

def get_show_list_by_shelf(
    ticket:dm.Ticket,
    shelf_id: int,
    search_query:str=None,
    show_playlisted:bool=True
):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return None
    shelf_episodes = db_episode.get_show_episode_list(
        ticket=ticket,
        shelf_id=shelf_id,
        load_episode_files=False,
        trim_episode_files=True,
        first_per_show=True,
        only_unwatched=True
    )
    with DbSession() as db:
        query = (
            db.query(dm.Show)
            .join(dm.ShowShelf)
            .filter(dm.ShowShelf.shelf_id == shelf_id)
            .options(sorm.joinedload(dm.Show.shelf))
            .options(sorm.joinedload(dm.Show.seasons))
        )
        if search_query:
            query = query.filter(dm.Show.name.ilike(f'%{search_query}%'))
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

        show_unwatched = {}
        for episode in shelf_episodes:
            show_unwatched[episode.season.show.id] = True

        results = []
        for show in shows:
            if not show.seasons:
                continue
            if not ticket.is_allowed(tag_provider=show.get_tag_ids):
                continue
            if show_playlisted == False and any('Playlist:' in xx.name for xx in show.tags):
                continue
            show = dm.set_primary_images(show)
            show.watched = not show.id in show_unwatched
            del show.image_files
            del show.metadata_files
            del show.seasons
            del show.created_at
            del show.updated_at
            del show.tags
            del show.screencap_image
            del show.directory
            del show.release_year
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
    episodes = db_episode.get_show_episode_list(ticket=ticket,shelf_id=shelf_id,load_episode_files=False,include_specials=True)
    episode_ids = [xx.id for xx in episodes]
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return False

def get_show_shelf_watched(ticket:dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,shelf_id=shelf_id,load_episode_files=False,include_specials=True)
    return all(xx.watched for xx in episodes)

def set_show_watched(ticket:dm.Ticket,show_id:int,is_watched:bool=True):
    show_episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id,include_specials=True)
    episode_ids = [xx.id for xx in show_episodes]
    if not show_episodes:
        return False
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return is_watched

def get_show_watched(ticket:dm.Ticket,show_id:int):
    show_episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id,load_episode_files=False,include_specials=True)
    if not show_episodes:
        return False
    return all(xx.watched for xx in show_episodes)

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
                episodes = db_episode.get_show_episode_list(
                    ticket=dm.Ticket(),
                    show_id=show.id,
                    include_specials=True,
                    load_episode_files=True,
                    first_per_show=True
                )
                if episodes and episodes[0].video_files:
                    results.append(show)
        return results

def delete_show_records(ticket:dm.Ticket, show_id:int):
    if not show_id:
        return False
    with DbSession() as db:
        db.execute(sql_text(f'delete from show where show.id = {show_id};'))
        db.commit()
        return True