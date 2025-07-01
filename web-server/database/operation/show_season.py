import util
import database.db_models as dm
from database.sql_alchemy import DbSession
import sqlalchemy.orm as sorm
import database.operation.show_episode as db_episode

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
    unwatched_episodes = db_episode.get_show_episode_list(
        ticket=ticket,
        show_id=show_id,
        load_episode_files=False,
        only_unwatched=True,
        first_per_season=True
    )
    with DbSession() as db:
        query = (
            db.query(dm.ShowSeason)
            .filter(dm.ShowSeason.show_id == show_id)
            .options(
                sorm.joinedload(dm.ShowSeason.show)
                .joinedload(dm.Show.shelf)
            )
            .options(sorm.joinedload(dm.ShowSeason.image_files))
            .options(sorm.joinedload(dm.ShowSeason.metadata_files))
        )
        show_seasons = query.order_by(dm.ShowSeason.season_order_counter).all()

        results = []
        season_unwatched = {}
        for episode in unwatched_episodes:
            season_unwatched[episode.season.id] = True
        for show_season in show_seasons:
            if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
                continue
            season = dm.set_primary_images(show_season)
            show = dm.set_primary_images(show_season.show)
            if not season.poster_image:
                season.poster_image = show.poster_image
                season.screencap_image = show.screencap_image
            season.name = util.get_season_title(season)
            season.watched = not season.id in season_unwatched
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
    episodes = db_episode.get_show_episode_list(ticket=ticket,show_season_id=season_id,load_episode_files=False)
    episode_ids = [xx.id for xx in episodes]
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return is_watched

def get_show_season_watched(ticket:dm.Ticket,season_id:int):
    season = get_show_season_by_id(ticket=ticket,season_id=season_id)
    if not season:
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,show_season_id=season_id,load_episode_files=False)
    return all(xx.watched for xx in episodes)