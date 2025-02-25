import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func
from database.operation.show import *
from database.operation.movie import *

def watched_to_bool(watched:dm.Watched):
    return False if watched == None else True


def set_movie_shelf_watched(cduid:int,shelf_id:int,is_watched:bool=True):
    with DbSession() as db:
        movie_ids = [xx.id for xx in get_movie_list_by_shelf(shelf_id=shelf_id)]
        deleted_movies = db.query(dm.Watched).filter(
            dm.Watched.cduid == cduid,
            dm.Watched.movie_id._in(movie_ids)
        ).delete()
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
                dm.Watched.cduid == cduid,
                dm.Watched.shelf_id == shelf_id
            ).delete()            

def get_movie_shelf_watched(cduid:int,shelf_id:int):
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id
        ).first()
        return watched_to_bool(watched)

def get_watched_shelf_movie_list(cduid:int,shelf_id:int,is_watched:bool=True):
    with DbSession() as db:
        movies = get_movie_list_by_shelf(shelf_id=shelf_id)
        movie_ids = [xx.id for xx in movies]
        watched_movies = db.query(dm.Watched).filter(
            dm.Watched.cduid == cduid,
            dm.Watched.movie_id._in(movie_ids)
        ).all()
        watched_ids = [xx.id for xx in watched_movies]
        if is_watched:
            return [xx for xx in movies if xx.id in watched_ids]
        return [xx for xx in movies if not xx.id in watched_ids]


def set_movie_watched(cduid:int,movie_id:int,is_watched:bool=True):
    with DbSession() as db:
        movie = get_movie_details_by_id(movie_id=movie_id)
        shelf_id = movie.shelf.id
        shelf_watched = get_movie_shelf_watched(cduid=cduid,shelf_id=shelf_id)
        movies = get_movie_list_by_shelf(shelf_id=shelf_id)        
        if is_watched and shelf_watched == None:                
                watched_movies = db.query(dm.Watched).filter(
                    dm.Watched.client_device_user_id == cduid,
                    dm.Watched.shelf_id == shelf_id
                ).all()
                if len(watched_movies) == len(movies) - 1:
                    set_movie_shelf_watched(cduid,shelf_id=shelf_id,is_watched=True)
                else:
                    dbm = dm.Watched()
                    dbm.client_device_user_id = cduid
                    dbm.movie_id = shelf_id            
                    db.add(dbm)
                    db.commit()
                    db.refresh(dbm)                                    
                    return True
        if not is_watched and shelf_watched != None:
            set_movie_shelf_watched(cduid=cduid,shelf_id=shelf_id,is_watched=False)
            all_other_movies = [xx for xx in movies if xx.id != movie_id]
            movies_watched = []
            for other_movie in all_other_movies:
                movies_watched.append({
                    'movie_id':other_movie.id,
                    'client_device_user_id': cduid
                })
            db.bulk_insert_mappings(dm.Watched,movies_watched)
            db.commit()
            return False
    return is_watched

def get_movie_watched(cduid:int,movie_id:int):
    movie = get_movie_details_by_id(movie_id=movie_id)
    shelf_id = movie.shelf.id
    shelf_watched = get_movie_shelf_watched(cduid=cduid,shelf_id=shelf_id)
    if shelf_watched:
        return True
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watchedclient_device_user_id == cduid,
        ).first()
        return watched_to_bool(watched)

def set_watch_status(
    status:am.WatchStatus,
    cduid:int
):
    with DbSession() as db:
        if status.status == True:    
            dbm = dm.Watched()
            dbm.client_device_user_id = cduid
            dbm.shelf_id = status.shelf_id
            dbm.movie_id = status.movie_id
            dbm.show_id = status.show_id
            dbm.show_season_id = status.show_season_id
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
            if status.show_id:
                show_episodes = get_show_episode_list(show_id=status.show_id)
                episode_ids = [xx.id for xx in show_episodes]
                deleted_episodes = (
                    db.query(dm.Watched)
                    .filter(dm.Watched.show_episode_id._in(episode_ids))
                    .delete()
                )
                show_seasons = get_show_season_list(show_id=status.show_id)
                season_ids = [xx.id for xx in show_seasons]                
                deleted_seasons = (
                    db.query(dm.Watched)
                    .filter(dm.Watched.show_season_id._in(season_ids))
                    .delete()
                )
                deleted_show = db.query(dm.Watched).filter(dm.Watched.show_id == status.show_id).delete()
                return {
                    'deleted_show': deleted_show,
                    'deleted_seasons': deleted_seasons,
                    'deleted_episodes': deleted_episodes
                }
            if status.show_season_id:
                season_episodes = get_show_season_episode_list(show_season_id=status.show_season_id)
                season_episode_ids = [xx.id for xx in season_episodes]
                deleted_episodes = (
                    db.query(dm.Watched)
                    .filter(dm.Watched.show_episode_id._in(season_episode_ids))
                    .delete()
                )
                deleted_season = db.query(dm.Watched).filter(dm.Watched.show_episode_id == status.show_episode_id).delete()
                db.commit()
                return {'deleted_episodes':deleted_episodes,'deleted_season':deleted_season}
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
    