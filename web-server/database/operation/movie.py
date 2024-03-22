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


def get_movie_details_by_id(movie_id: int):
    with DbSession() as db:
        movie = (
            db.query(dm.Movie)
            .options(sorm.joinedload(dm.Movie.video_files))
            .options(sorm.joinedload(dm.Movie.shelf))
            .filter(dm.Movie.id == movie_id)
            .first()
        )
        movie.convert_local_paths_to_web_paths(config=config)
        return movie
        # movie.video_files = db.scalars(sa.select(dm.MovieVideoFile).filter(dm.MovieVideoFile.movie_id == movie_id)).all();
        # return movie


def get_movie(name: str, release_year: int):
    with DbSession() as db:
        return (
            db.query(dm.Movie)
            .filter(dm.Movie.release_year == release_year)
            .filter(dm.Movie.name == name)
            .first()
        )


def get_movie_list_by_shelf(shelf_id: int):
    with DbSession() as db:
        return (
            db.query(dm.Movie)
            .join(dm.MovieShelf)
            .filter(dm.MovieShelf.shelf_id == shelf_id)
            .all()
        )


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
