import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config

def create_movie(name: str, release_year: int):
    with DbSession() as db:
        dbm = dm.Movie()
        dbm.name = name
        dbm.release_year = release_year
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def add_movie_to_shelf(movie_id: int, shelf_id: int):
    with DbSession() as db:
        dbm = dm.MovieShelf()
        dbm.shelf_id = shelf_id
        dbm.movie_id = movie_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_by_id(ticket:dm.Ticket,movie_id: int):
    with DbSession() as db:
        query = (
            db.query(dm.Movie)            
            .filter(dm.Movie.id == movie_id)            
            .options(sorm.joinedload(dm.Movie.video_files))
            .options(sorm.joinedload(dm.Movie.image_files))
            .options(sorm.joinedload(dm.Movie.shelf))
        )

        movie = query.first()
        if not ticket.is_allowed(shelf_id=movie.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=movie.get_tag_ids):
            return None
        return movie

def get_movie_by_name_and_year(name: str, release_year: int):
    with DbSession() as db:
        return (
            db.query(dm.Movie)
            .filter(dm.Movie.release_year == release_year)
            .filter(dm.Movie.name == name)
            .first()
        )

def get_movie_list_by_shelf(ticket:dm.Ticket,shelf_id: int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        query = (
            db.query(dm.Movie)
            .join(dm.MovieShelf)
            .filter(dm.MovieShelf.shelf_id == shelf_id)
            .options(sorm.joinedload(dm.Movie.shelf))
        )
        if ticket.has_tag_restrictions():
            query = query.options(sorm.joinedload(dm.Movie.tags))
        query = (
            query.filter(dm.MovieShelf.shelf_id == shelf_id)
            .order_by(dm.Movie.name)
        )
        movies = query.all()
        # TODO
        # It would be more performant to do this filtering in the database.
        # But I like how simple this code is.
        # I will revisit if it actually becomes a performance bottleneck
        results = []
        for movie in movies:
            if not ticket.is_allowed(tag_provider=movie.get_tag_ids):
                continue
            results.append(dm.set_primary_images(movie))
        return results

def create_movie_video_file(movie_id: int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.MovieVideoFile()
        dbm.movie_id = movie_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_video_file(movie_id: int, video_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.MovieVideoFile)
            .filter(dm.MovieVideoFile.movie_id == movie_id)
            .filter(dm.MovieVideoFile.video_file_id == video_file_id)
            .first()
        )

def create_movie_image_file(movie_id: int, image_file_id: int):
    with DbSession() as db:
        dbm = dm.MovieImageFile()
        dbm.movie_id = movie_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_image_file(movie_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.MovieImageFile)
            .filter(dm.MovieImageFile.movie_id == movie_id)
            .filter(dm.MovieImageFile.image_file_id == image_file_id)
            .first()
        )

def create_movie_metadata_file(movie_id: int, metadata_file_id: int):
    with DbSession() as db:
        dbm = dm.MovieMetadataFile()
        dbm.movie_id = movie_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_metadata_file(movie_id: int, metadata_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.MovieMetadataFile)
            .filter(dm.MovieMetadataFile.movie_id == movie_id)
            .filter(dm.MovieMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_movie_tag(movie_id: int, tag_id: int):    
    with DbSession() as db:
        existing = (
            db.query(dm.MovieTag)
            .filter(
                dm.MovieTag.movie_id == movie_id,
                dm.MovieTag.tag_id == tag_id
            ).first()
        )
        if existing:
            return existing
        dbm = dm.MovieTag()
        dbm.movie_id = movie_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_movie_shelf_watched(ticket:dm.Ticket,shelf_id:int,is_watched:bool=True):
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
                dm.Watched.client_device_user_id,
                dm.Watched.shelf_id == shelf_id
            ).delete()            
            db.commit()

def get_movie_shelf_watched(ticket:dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False    
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.movie_id == None
        ).first()
        return False if watched == None else True

def get_partial_shelf_movie_list(ticket:dm.Ticket,shelf_id:int,only_watched:bool=True):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        movies = get_movie_list_by_shelf(ticket=ticket,shelf_id=shelf_id)
        if not movies:
            return []
        shelf_watched = get_movie_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        if shelf_watched:
            return movies if only_watched else []
        watched_movies = (db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id.in_(ticket.watch_group),
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.movie_id != None            
            )
            .distinct(dm.Watched.movie_id)
            .all()
        )
        watched_ids = [xx.movie_id for xx in watched_movies]
        if only_watched:
            return [xx for xx in movies if xx.id in watched_ids]
        return [xx for xx in movies if not xx.id in watched_ids]


def set_movie_watched(ticket:dm.Ticket,movie_id:int,is_watched:bool=True):
    with DbSession() as db:
        movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
        if not movie:
            return False
        shelf_id = movie.shelf.id
        shelf_watched = get_movie_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        movies = get_movie_list_by_shelf(ticket=ticket,shelf_id=shelf_id)
        if not movies:
            return False
        if is_watched and not shelf_watched:
            watched_movies = db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id.in_(ticket.watch_group),
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.movie_id != None,                
            ).distinct(dm.Watched.movie_id).all()
            if len(watched_movies) == len(movies) - 1:
                set_movie_shelf_watched(ticket=ticket,shelf_id=shelf_id,is_watched=True)
                return True
            else:
                dbm = dm.Watched()
                dbm.client_device_user_id = ticket.cduid
                dbm.shelf_id = shelf_id
                dbm.movie_id = movie_id
                db.add(dbm)
                db.commit()
                db.refresh(dbm)                                    
                return True
        if not is_watched and shelf_watched:
            set_movie_shelf_watched(ticket=ticket,shelf_id=shelf_id,is_watched=False)
            movies_watched = []
            for other_movie in movies:
                if other_movie.id == movie_id:
                    continue
                movies_watched.append({
                    'movie_id': other_movie.id,
                    'shelf_id': shelf_id,
                    'client_device_user_id': ticket.cduid
                })
            db.bulk_insert_mappings(dm.Watched,movies_watched)
            db.commit()
            return False
        if not is_watched and not shelf_watched:
            db.query(dm.Watched).filter(
                dm.Watched.client_device_user_id.in_(ticket.watch_group),
                dm.Watched.shelf_id == shelf_id,
                dm.Watched.movie_id == movie_id
            ).delete()          
            db.commit()
            return False
    return is_watched

def get_movie_watched(ticket:dm.Ticket,movie_id:int):
    movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
    if not movie:
        return False
    shelf_id = movie.shelf.id
    shelf_watched = get_movie_shelf_watched(ticket=ticket,shelf_id=shelf_id)
    if shelf_watched:
        return True
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.movie_id == movie_id
        ).first()
        return False if watched == None else True

def set_movie_watch_progress(ticket:dm.Ticket, watch_progress:am.WatchProgress):
    movie = get_movie_by_id(ticket=ticket,movie_id=watch_progress.movie_id)
    if not movie:
        return False
    with DbSession() as db:
        db.query(dm.WatchProgress).filter(
                dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dm.WatchProgress.movie_id == watch_progress.movie_id
            ).delete()
        db.commit()
        watch_percent = float(watch_progress.played_seconds) / float(watch_progress.duration_seconds)
        if watch_percent <= config.watch_progress_unwatched_threshold:
            set_movie_watched(ticket=ticket,movie_id=watch_progress.movie_id,is_watched=False)
        elif watch_percent >= config.watch_progress_watched_threshold:
            set_movie_watched(ticket=ticket,movie_id=watch_progress.movie_id,is_watched=True)
        else:
            dbm = dm.WatchProgress()
            dbm.client_device_user_id = ticket.cduid
            dbm.movie_id = watch_progress.movie_id
            dbm.duration_seconds = watch_progress.duration_seconds
            dbm.played_seconds = watch_progress.played_seconds
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
    return True