import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.show as db_show

def get_episode_list_by_shelf(shelf_id:int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .options(sorm.joinedload(dm.ShowEpisode.season))
            .options(sorm.joinedload(dm.ShowEpisode.season.show))
            .filter(dm.ShowEpisode.season.show.shelf.id == shelf_id).all()
        )

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
    seasons = db_show.get_show_season_list_by_show_id(show_id=show_id)
    season_ids = [xx.id for xx in seasons]
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.show_season_id.in_(season_ids))
            .all()
        )
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