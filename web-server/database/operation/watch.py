import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func
from database.operation.show import *
from database.operation.movie import *

# Movie Shelf / Movie List / Movie watched status

def watched_to_bool(watched:dm.Watched):
    return False if watched == None else True

def set_movie_shelf_watched(cduid:int,shelf_id:int,is_watched:bool=True):
    with DbSession() as db:
        movie_ids = [xx.id for xx in get_movie_list_by_shelf(shelf_id=shelf_id)]
        deleted_movies = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.movie_id.in_(movie_ids)
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
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id
            ).delete()            

def get_movie_shelf_watched(cduid:int,shelf_id:int):
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id
        ).first()
        return watched_to_bool(watched)

def get_partial_shelf_movie_list(cduid:int,shelf_id:int,only_watched:bool=True):
    with DbSession() as db:
        movies = get_movie_list_by_shelf(shelf_id=shelf_id)
        movie_ids = [xx.id for xx in movies]
        watched_movies = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.movie_id.in_(movie_ids)
        ).all()
        watched_ids = [xx.id for xx in watched_movies]
        if only_watched:
            return [xx for xx in movies if xx.id in watched_ids]
        return [xx for xx in movies if not xx.id in watched_ids]


def set_movie_watched(cduid:int,movie_id:int,is_watched:bool=True):
    print(f"Watched {movie_id} is {is_watched}")
    with DbSession() as db:
        movie = get_movie_details_by_id(movie_id=movie_id)
        shelf_id = movie.shelf.id
        shelf_watched = get_movie_shelf_watched(cduid=cduid,shelf_id=shelf_id)
        movies = get_movie_list_by_shelf(shelf_id=shelf_id)  
        print(is_watched)
        print(shelf_watched)      
        if is_watched and not shelf_watched:
            print(1)
            watched_movies = db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id
            ).all()
            if len(watched_movies) == len(movies) - 1:
                print(2)
                set_movie_shelf_watched(cduid,shelf_id=shelf_id,is_watched=True)
                return True
            else:
                print(3)
                dbm = dm.Watched()
                dbm.client_device_user_id = cduid
                dbm.movie_id = movie_id
                db.add(dbm)
                db.commit()
                db.refresh(dbm)                                    
                return True
        if not is_watched and shelf_watched:
            print(4)
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
        if not is_watched and not shelf_watched:
            db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.movie_id == movie_id
            ).delete()          
            return False
    print(5)
    return is_watched

def get_movie_watched(cduid:int,movie_id:int):
    movie = get_movie_details_by_id(movie_id=movie_id)
    shelf_id = movie.shelf.id
    shelf_watched = get_movie_shelf_watched(cduid=cduid,shelf_id=shelf_id)
    print("1.1")
    if shelf_watched:
        print("1.2")
        return True
    with DbSession() as db:
        print("2.0")
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.movie_id == movie_id
        ).first()
        return watched_to_bool(watched)

# Show Shelf / Show List / Show / Season List / Season / Episode List / Episode watch status

def set_show_shelf_watched(cduid:int,shelf_id:int,is_watched:bool=True):
    with DbSession() as db:
        show_ids = [xx.id for xx in get_show_list_by_shelf(shelf_id=shelf_id)]
        season_ids = [xx.id for xx in get_show_season_list_by_shelf(shelf_id=shelf_id)]
        episode_ids = [xx.id for xx in get_episode_list_by_shelf(shelf_id=shelf_id)]
        deleted_shows = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.show_id.in_(show_ids)
        ).delete()
        deleted_seasons = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.show_season_id.in_(season_ids)
        ).delete()
        deleted_episodes = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.show_episode_id.in_(episode_ids)
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
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.shelf_id == shelf_id
            ).delete()            

def get_show_shelf_watched(cduid:int,shelf_id:int):
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == cduid,
            dm.Watched.shelf_id == shelf_id
        ).first()
        return watched_to_bool(watched)

