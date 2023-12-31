import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_movie(name: str, release_year: int):
    with DbSession() as db:
        dbm = dm.Movie()
        dbm.name = name
        dbm.release_year = release_year
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_movie(name: str, release_year: int):
    with DbSession() as db:
        return db.query(dm.Movie).filter(dm.Movie.release_year == release_year).filter(dm.Movie.name == name).first()

def create_movie_video_file(movie_id: int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.MovieVideoFile()
        dbm.movie_id = movie_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_video_file(movie_id: int, video_file_id:int):
    with DbSession() as db:
        return db.query(dm.MovieVideoFile).filter(dm.MovieVideoFile.movie_id == movie_id).filter(dm.MovieVideoFile.video_file_id == video_file_id).first()