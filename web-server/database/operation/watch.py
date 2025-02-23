import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func

def watched_to_bool(watched:dm.Watched):
    return False if watched == None else True

def set_watch_status(
    status:am.WatchStatus,
    cduid:int
):
    with DbSession() as db:
        if status.status == True:    
            dbm = dm.Watched()
            dbm.client_device_user_id = cduid
            dbm.movie_id = status.movie_id
            dbm.show_episode_id = status.show_episode_id
            dbm.streamable_id = status.streamable_id
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
            return dbm
        if status.status == False:
            if status.movie_id:
                deleted = db.query(dm.Watched).filter(dm.Watched.movie_id == status.movie_id).delete()
                db.commit()
                return deleted
            if status.show_episode_id:
                deleted = db.query(dm.Watched).filter(dm.Watched.show_episode_id == status.show_episode_id).delete()
                db.commit()
                return deleted    
            if status.streamable_id:
                deleted = db.query(dm.Watched).filter(dm.Watched.streamable_id == status.streamable_id).delete()
                db.commit()
                return deleted

def get_shelf_watch_status(
    cduid:int,
    shelf_id:int
):
    with DbSession() as db:
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id
            )
            .first()
        )
        return watched_to_bool(watched)

def get_movie_watch_status(
    cduid:int,
    movie_id:int
):
    with DbSession() as db:
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.movie_id == movie_id
            )
            .first()
        )
        return watched_to_bool(watched)

def get_show_episode_watch_status(
    cduid:int,
    episode_id:int
):
    with DbSession() as db:
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.show_episode_id == episode_id
            )
            .first()
        )
        return watched_to_bool(watched)

def get_show_season_watch_status(
    cduid:int,
    season_id:int
):
    with DbSession() as db:
        season_watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.show_season_id == season_id
            ).first()
        )
        if season_watched != None:
            return {
                'season_watched': True,
                'watched_count': None,
                'episode_count': None,
                'watched_episode_ids': None
            }
        season_episodes = (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.show_season_id == season_id)
            .all()
        )
        season_episode_ids = [xx.id for xx in season_episodes]
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.show_episode_id._in(season_episode_ids)
            )
            .all()
        )
        return {
            'season_watched': len(watched) == len(season_episode_ids),
            'watched_count': len(watched),
            'episode_count': len(season_episode_ids),
            'watched_episode_ids':[xx.show_episode_id for xx in watched]
        }

def get_show_watch_status(
    cduid:int,
    show_id:int
):
    with DbSession() as db:
        show_watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.show_id == show_id)
        ).first()
        if show_watched != None:
            return {
                'show_watched': True,
                'watched_count': None,
                'episode_count': None,
                'watched_episode_ids': None,
                'watched_season_counts': None
            }
        seasons = (
            db.query(dm.ShowSeason)
            .filter(dm.ShowSeason.show_id == show_id)
            .all()
        )
        season_ids = [xx.id for xx in seasons]
        show_episodes = (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.show_season_id._in(season_ids))
            .all()
        )
        show_episode_ids = [xx.id for xx in show_episodes]
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.show_episode_id._in(show_episode_ids)
            )
            .all()
        )
        season_counts = {}
        episode_lookup = {}
        for show_episode in show_episodes:
            if not show_episode.show_season_id in season_counts:
                season_counts[show_episode.show_season_id] = 0
            season_counts[show_episode.show_season_id] += 1
            episode_lookup[show_episode.id] = show_episode
        for watched_episode in watched:
            show_episode = episode_lookup[watched_episode.show_episode_id]
            if not show_episode.show_season_id in season_counts:
                season_counts[show_episode.show_season_id] = 0
            season_counts[show_episode.show_season_id] -= 1
        return {
            'show_watched': len(watched) == len(show_episode_ids),
            'watched_count': len(watched),
            'episode_count':len(show_episode_ids),
            'watched_episode_ids': [xx.show_episode_id for xx in watched],
            'watched_season_counts': season_counts
        }

def get_shelf_show_list_watch_status(cduid:int,shelf_id:int):
    shelf_watched = get_shelf_watch_status(cduid=cduid,shelf_id=shelf_id)
    if shelf_watched:
        return {

        }
    