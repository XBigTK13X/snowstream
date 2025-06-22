import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import os
import database.operation.movie as db_movie
import database.operation.show_episode as db_episode

def purge_missing_video_file_records():
    deleted_records = []
    with DbSession() as db:
        movie_video_files = db.query(dm.MovieVideoFile).options(sorm.joinedload(dm.MovieVideoFile.video_file)).all()
        for movie_video_file in movie_video_files:
            if not os.path.exists(movie_video_file.video_file.local_path):
                deleted_records.append(movie_video_file.video_file.local_path)
                db.query(dm.MovieVideoFile).filter(
                    dm.MovieVideoFile.movie_id == movie_video_file.movie_id,
                    dm.MovieVideoFile.video_file_id == movie_video_file.video_file_id
                ).delete()
                db.query(dm.VideoFile).filter(
                    dm.VideoFile.id == movie_video_file.video_file_id
                ).delete()
        db.commit()

        show_episode_video_files = db.query(dm.ShowEpisodeVideoFile).options(sorm.joinedload(dm.ShowEpisodeVideoFile.video_file)).all()
        for show_episode_video_file in show_episode_video_files:
            if not os.path.exists(show_episode_video_file.video_file.local_path):
                deleted_records.append(show_episode_video_file.video_file.local_path)
                db.query(dm.ShowEpisodeVideoFile).filter(
                    dm.ShowEpisodeVideoFile.show_episode_id == show_episode_video_file.show_episode_id,
                    dm.ShowEpisodeVideoFile.video_file_id == show_episode_video_file.video_file_id
                ).delete()
                db.query(dm.VideoFile).filter(
                    dm.VideoFile.id == show_episode_video_file.video_file_id
                ).delete()
        db.commit()
    return deleted_records

def purge_missing_image_file_records():
    deleted_records = []
    with DbSession() as db:
        movie_image_files = db.query(dm.MovieImageFile).options(sorm.joinedload(dm.MovieImageFile.image_file)).all()
        for movie_image_file in movie_image_files:
            if not os.path.exists(movie_image_file.image_file.local_path):
                deleted_records.append(movie_image_file.image_file.local_path)
                db.query(dm.MovieImageFile).filter(
                    dm.MovieImageFile.movie_id == movie_image_file.movie_id,
                    dm.MovieImageFile.image_file_id == movie_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == movie_image_file.image_file_id
                ).delete()
        db.commit()

        show_image_files = db.query(dm.ShowImageFile).options(sorm.joinedload(dm.ShowImageFile.image_file)).all()
        for show_image_file in show_image_files:
            if not os.path.exists(show_image_file.image_file.local_path):
                deleted_records.append(show_image_file.image_file.local_path)
                db.query(dm.ShowImageFile).filter(
                    dm.ShowImageFile.show_id == show_image_file.show_id,
                    dm.ShowImageFile.image_file_id == show_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == show_image_file.image_file_id
                ).delete()
        db.commit()

        show_season_image_files = db.query(dm.ShowSeasonImageFile).options(sorm.joinedload(dm.ShowSeasonImageFile.image_file)).all()
        for show_season_image_file in show_season_image_files:
            if not os.path.exists(show_season_image_file.image_file.local_path):
                deleted_records.append(show_season_image_file.image_file.local_path)
                db.query(dm.ShowSeasonImageFile).filter(
                    dm.ShowSeasonImageFile.show_season_id == show_season_image_file.show_season_id,
                    dm.ShowSeasonImageFile.image_file_id == show_season_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == show_season_image_file.image_file_id
                ).delete()
        db.commit()

        show_episode_image_files = db.query(dm.ShowEpisodeImageFile).options(sorm.joinedload(dm.ShowEpisodeImageFile.image_file)).all()
        for show_episode_image_file in show_episode_image_files:
            if not os.path.exists(show_episode_image_file.image_file.local_path):
                deleted_records.append(show_episode_image_file.image_file.local_path)
                db.query(dm.ShowEpisodeImageFile).filter(
                    dm.ShowEpisodeImageFile.show_episode_id == show_episode_image_file.show_episode_id,
                    dm.ShowEpisodeImageFile.image_file_id == show_episode_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == show_episode_image_file.image_file_id
                ).delete()
        db.commit()
    return deleted_records

def purge_missing_metadata_file_records():
    deleted_records = []
    with DbSession() as db:
        movie_metadata_files = db.query(dm.MovieMetadataFile).options(sorm.joinedload(dm.MovieMetadataFile.metadata_file)).all()
        for movie_metadata_file in movie_metadata_files:
            if not os.path.exists(movie_metadata_file.metadata_file.local_path):
                deleted_records.append(movie_metadata_file.metadata_file.local_path)
                db.query(dm.MovieMetadataFile).filter(
                    dm.MovieMetadataFile.movie_id == movie_metadata_file.movie_id,
                    dm.MovieMetadataFile.metadata_file_id == movie_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == movie_metadata_file.metadata_file_id
                ).delete()
        db.commit()

        show_metadata_files = db.query(dm.ShowMetadataFile).options(sorm.joinedload(dm.ShowMetadataFile.metadata_file)).all()
        for show_metadata_file in show_metadata_files:
            if not os.path.exists(show_metadata_file.metadata_file.local_path):
                deleted_records.append(show_metadata_file.metadata_file.local_path)
                db.query(dm.ShowMetadataFile).filter(
                    dm.ShowMetadataFile.show_id == show_metadata_file.show_id,
                    dm.ShowMetadataFile.metadata_file_id == show_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == show_metadata_file.metadata_file_id
                ).delete()
        db.commit()

        show_season_metadata_files = db.query(dm.ShowSeasonMetadataFile).options(sorm.joinedload(dm.ShowSeasonMetadataFile.metadata_file)).all()
        for show_season_metadata_file in show_season_metadata_files:
            if not os.path.exists(show_season_metadata_file.metadata_file.local_path):
                deleted_records.append(show_season_metadata_file.metadata_file.local_path)
                db.query(dm.ShowSeasonMetadataFile).filter(
                    dm.ShowSeasonMetadataFile.show_season_id == show_season_metadata_file.show_season_id,
                    dm.ShowSeasonMetadataFile.metadata_file_id == show_season_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == show_season_metadata_file.metadata_file_id
                ).delete()
        db.commit()

        show_episode_metadata_files = db.query(dm.ShowEpisodeMetadataFile).options(sorm.joinedload(dm.ShowEpisodeMetadataFile.metadata_file)).all()
        for show_episode_metadata_file in show_episode_metadata_files:
            if not os.path.exists(show_episode_metadata_file.metadata_file.local_path):
                deleted_records.append(show_episode_metadata_file.metadata_file.local_path)
                db.query(dm.ShowEpisodeMetadataFile).filter(
                    dm.ShowEpisodeMetadataFile.show_episode_id == show_episode_metadata_file.show_episode_id,
                    dm.ShowEpisodeMetadataFile.metadata_file_id == show_episode_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == show_episode_metadata_file.metadata_file_id
                ).delete()
        db.commit()
    return deleted_records

def find_shelf_content_without_video_files():
    results = []
    with DbSession() as db:
        ticket = dm.Ticket(ignore_watch_group=True)
        with DbSession() as db:
            movies = db_movie.get_movie_list(ticket=ticket)
            for movie in movies:
                if not movie.video_files:
                    results.append(movie.directory)

            episodes = db_episode.get_show_episode_list(ticket=ticket)
            for episode in episodes:
                if not episode.video_files:
                    results.append(episode.season.directory)
        return results