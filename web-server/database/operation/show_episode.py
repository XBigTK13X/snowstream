import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.show as db_show
import database.operation.show_season as db_season

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

def get_partial_show_episode_list(cduid:int,season_id:int,only_watched:bool=True):
    with DbSession() as db:
        episodes = get_show_season_episode_list(show_season_id=season_id,include_files=True)
        season = db_season.get_show_season_by_id(season_id=season_id)
        show = db_show.get_show_by_id(show_id=season.show.id)
        shelf_watched = db_show.get_show_shelf_watched(cduid=cduid,shelf_id=show.shelf.id)        
        if shelf_watched:
            return episodes if only_watched else []
        show_watched = db_show.get_show_watched(cduid=cduid,show_id=show.id)
        if show_watched:
            return episodes if only_watched else []        
        season_watched = db_season.get_show_season_watched(cduid=cduid,season_id=season_id)
        if season_watched:
            return episodes if only_watched else []        
        watched_episodes = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == show.shelf.id,
            dm.Watched.show_id == show.id,
            dm.Watched.show_season_id == season_id,
            dm.Watched.show_episode_id == None
        ).all()
        watched_ids = [xx.show_episode_id for xx in watched_episodes]
        print(watched_ids)
        if only_watched:
            return [xx for xx in episodes if xx.id in watched_ids]
        return [xx for xx in episodes if not xx.id in watched_ids]

def set_show_episode_watched(cduid:int,season_id:int,is_watched:bool=True):
    with DbSession() as db:
        season = db_season.get_show_season_by_id(season_id=season_id)
        show = db_show.get_show_by_id(show_id=season.show_id)
        shelf_id = show.shelf.id
        shelf_watched = db_show.get_show_shelf_watched(cduid=cduid,shelf_id=shelf_id)
        show_watched = db_show.get_show_watched(cduid=cduid,show_id=show.id)
        seasons = db_season.get_show_season_list_by_show_id(show_id=show.id,include_files=False)
        db.query(dm.Watched).filter(
            dm.Watched.show_season_id == season_id
        ).delete()
        db.commit()
        import pprint
        pprint.pprint({
            'is_watched':is_watched,
            'show_watched': show_watched,
            'shelf_watched': shelf_watched
        })
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

def get_show_episode_watched(cduid:int,season_id:int):
    season = db_season.get_show_season_by_id(season_id=season_id)
    show_watched = db_show.get_show_watched(cduid=cduid,show_id=season.show.id)
    if show_watched:
        return True    
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == season.show.shelf.id,
            dm.Watched.show_id == season.show.id,
            dm.Watched.show_season_id == season_id
        ).first()
        return False if watched == None else True