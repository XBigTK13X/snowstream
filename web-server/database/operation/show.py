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
            .filter(dm.ShowShelf.shelf_id == shelf_id)
            .order_by(dm.Show.name)
            .all()
        )
        for show in shows:
            show.convert_local_paths_to_web_paths(config=config)
        return shows

def get_show_season_list_by_shelf(shelf_id:int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeason)
            .options(sorm.joinedload(dm.ShowSeason.show))
            .filter(dm.ShowSeason.show.shelf_id == shelf_id)
            .all()
        )

def get_episode_list_by_shelf(shelf_id:int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .options(sorm.joinedload(dm.ShowEpisode.season))
            .options(sorm.joinedload(dm.ShowEpisode.season.show))
            .filter(dm.ShowEpisode.season.show.shelf_id == shelf_id).all()
        )


def create_show_season(show_id: int, season_order_counter: int):
    with DbSession() as db:
        dbm = dm.ShowSeason()
        dbm.season_order_counter = season_order_counter
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_season(show_id: int, season_order_counter: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowSeason)
            .options(sorm.joinedload(dm.ShowSeason.tags))
            .filter(dm.ShowSeason.show_id == show_id)
            .filter(dm.ShowSeason.season_order_counter == season_order_counter)
            .first()
        )


def get_show_season_list(show_id: int,include_files:bool=False):
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


def create_show_episode(show_season_id: int, episode_order_counter: int):
    with DbSession() as db:
        dbm = dm.ShowEpisode()
        dbm.episode_order_counter = episode_order_counter
        dbm.show_season_id = show_season_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_episode_list(show_id:int):
    seasons = get_show_season_list(show_id=show_id)
    season_ids = [xx.id for xx in seasons]
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.show_season_id.in_(season_ids))
            .all()
        )

# https://docs.sqlalchemy.org/en/20/orm/queryguide/inheritance.html
def get_show_episode_details_by_id(episode_id: int):
    with DbSession() as db:
        episode = (
            db.query(dm.ShowEpisode)
            .options(sorm.joinedload(dm.ShowEpisode.video_files))
            .options(
                sorm.joinedload(dm.ShowEpisode.season)
                .joinedload(dm.ShowSeason.show)
                .joinedload(dm.Show.shelf)
            )
            .filter(dm.ShowEpisode.id == episode_id)
            .first()
        )
        episode.convert_local_paths_to_web_paths(config=config)
        return episode


def get_show_episode(show_season_id: int, episode_order_counter: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .options(sorm.joinedload(dm.ShowEpisode.tags))
            .filter(dm.ShowEpisode.show_season_id == show_season_id)
            .filter(dm.ShowEpisode.episode_order_counter == episode_order_counter)
            .first()
        )


def get_show_season_episode_list(show_season_id: int,include_files:bool=False):
    with DbSession() as db:
        query = db.query(dm.ShowEpisode)
        if include_files:
            query = (
                query.options(sorm.joinedload(dm.ShowEpisode.image_files))
                .options(sorm.joinedload(dm.ShowEpisode.metadata_files))
                .options(sorm.joinedload(dm.ShowEpisode.tags))
            )
        episodes = (
            query.filter(dm.ShowEpisode.show_season_id == show_season_id)
            .order_by(dm.ShowEpisode.episode_order_counter)
            .all()
        )
        if include_files:
            for episode in episodes:
                episode.convert_local_paths_to_web_paths(config=config)
        return episodes

def create_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeVideoFile()
        dbm.show_episode_id = show_episode_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisodeVideoFile)
            .filter(dm.ShowEpisodeVideoFile.show_episode_id == show_episode_id)
            .filter(dm.ShowEpisodeVideoFile.video_file_id == video_file_id)
            .first()
        )


def create_show_episode_image_file(show_episode_id: int, image_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeImageFile()
        dbm.show_episode_id = show_episode_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_episode_image_file(show_episode_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisodeImageFile)
            .filter(dm.ShowEpisodeImageFile.show_episode_id == show_episode_id)
            .filter(dm.ShowEpisodeImageFile.image_file_id == image_file_id)
            .first()
        )


def create_show_episode_metadata_file(show_episode_id: int, metadata_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeMetadataFile()
        dbm.show_episode_id = show_episode_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_episode_metadata_file(show_episode_id: int, metadata_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisodeMetadataFile)
            .filter(dm.ShowEpisodeMetadataFile.show_episode_id == show_episode_id)
            .filter(dm.ShowEpisodeMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )


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

def upsert_show_episode_tag(show_episode_id: int, tag_id: int):    
    with DbSession() as db:
        existing = db.query(dm.ShowEpisodeTag).filter(
            dm.ShowEpisodeTag.show_episode_id == show_episode_id and dm.ShowEpisodeTag.tag_id == tag_id
        ).first()
        if existing:
            return existing
        dbm = dm.ShowEpisodeTag()
        dbm.show_episode_id = show_episode_id
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
            dm.Watched.shelf_id == shelf_id
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
        watched_ids = [xx.movie_id for xx in watched_shows]
        if only_watched:
            return [xx for xx in shows if xx.id in watched_ids]
        return [xx for xx in shows if not xx.id in watched_ids]
