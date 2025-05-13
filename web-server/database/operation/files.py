import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config

def purge_missing_video_file_records(existing_video_file_paths):
    purged_count = 0
    with DbSession() as db:
        movie_video_files = db.query(dm.MovieVideoFile).options(sorm.joinedload(dm.MovieVideoFile.video_file)).all()
        for movie_video_file in movie_video_files:
            if not movie_video_file.video_file.local_path in existing_video_file_paths:
                db.query(dm.MovieVideoFile).filter(
                    dm.MovieVideoFile.movie_id == movie_video_file.movie_id,
                    dm.MovieVideoFile.video_file_id == movie_video_file.video_file_id
                ).delete()
                db.query(dm.VideoFile).filter(
                    dm.VideoFile.id == movie_video_file.video_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_episode_video_files = db.query(dm.ShowEpisodeVideoFile).options(sorm.joinedload(dm.ShowEpisodeVideoFile.video_file)).all()
        for show_episode_video_file in show_episode_video_files:
            if not show_episode_video_file.video_file.local_path in existing_video_file_paths:
                db.query(dm.ShowEpisodeVideoFile).filter(
                    dm.ShowEpisodeVideoFile.show_episode_id == show_episode_video_file.show_episode_id,
                    dm.ShowEpisodeVideoFile.video_file_id == show_episode_video_file.video_file_id
                ).delete()
                db.query(dm.VideoFile).filter(
                    dm.VideoFile.id == show_episode_video_file.video_file_id
                ).delete()
                purged_count += 1
        db.commit()
    return purged_count

def purge_missing_image_file_records(existing_image_file_paths):
    purged_count = 0
    with DbSession() as db:
        movie_image_files = db.query(dm.MovieImageFile).options(sorm.joinedload(dm.MovieImageFile.image_file)).all()
        for movie_image_file in movie_image_files:
            if not movie_image_file.image_file.local_path in existing_image_file_paths:
                db.query(dm.MovieImageFile).filter(
                    dm.MovieImageFile.movie_id == movie_image_file.movie_id,
                    dm.MovieImageFile.image_file_id == movie_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == movie_image_file.image_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_image_files = db.query(dm.ShowImageFile).options(sorm.joinedload(dm.ShowImageFile.image_file)).all()
        for show_image_file in show_image_files:
            if not show_image_file.image_file.local_path in existing_image_file_paths:
                db.query(dm.ShowImageFile).filter(
                    dm.ShowImageFile.show_id == show_image_file.show_id,
                    dm.ShowImageFile.image_file_id == show_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == show_image_file.image_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_season_image_files = db.query(dm.ShowSeasonImageFile).options(sorm.joinedload(dm.ShowSeasonImageFile.image_file)).all()
        for show_season_image_file in show_season_image_files:
            if not show_season_image_file.image_file.local_path in existing_image_file_paths:
                db.query(dm.ShowSeasonImageFile).filter(
                    dm.ShowSeasonImageFile.show_season_id == show_season_image_file.show_season_id,
                    dm.ShowSeasonImageFile.image_file_id == show_season_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == show_season_image_file.image_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_episode_image_files = db.query(dm.ShowEpisodeImageFile).options(sorm.joinedload(dm.ShowEpisodeImageFile.image_file)).all()
        for show_episode_image_file in show_episode_image_files:
            if not show_episode_image_file.image_file.local_path in existing_image_file_paths:
                db.query(dm.ShowEpisodeImageFile).filter(
                    dm.ShowEpisodeImageFile.show_episode_id == show_episode_image_file.show_episode_id,
                    dm.ShowEpisodeImageFile.image_file_id == show_episode_image_file.image_file_id
                ).delete()
                db.query(dm.ImageFile).filter(
                    dm.ImageFile.id == show_episode_image_file.image_file_id
                ).delete()
                purged_count += 1
        db.commit()
    return purged_count

def purge_missing_metadata_file_records(existing_metadata_file_paths):
    purged_count = 0
    with DbSession() as db:
        movie_metadata_files = db.query(dm.MovieMetadataFile).options(sorm.joinedload(dm.MovieMetadataFile.metadata_file)).all()
        for movie_metadata_file in movie_metadata_files:
            if not movie_metadata_file.metadata_file.local_path in existing_metadata_file_paths:
                db.query(dm.MovieMetadataFile).filter(
                    dm.MovieMetadataFile.movie_id == movie_metadata_file.movie_id,
                    dm.MovieMetadataFile.metadata_file_id == movie_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == movie_metadata_file.metadata_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_metadata_files = db.query(dm.ShowMetadataFile).options(sorm.joinedload(dm.ShowMetadataFile.metadata_file)).all()
        for show_metadata_file in show_metadata_files:
            if not show_metadata_file.metadata_file.local_path in existing_metadata_file_paths:
                db.query(dm.ShowMetadataFile).filter(
                    dm.ShowMetadataFile.show_id == show_metadata_file.show_id,
                    dm.ShowMetadataFile.metadata_file_id == show_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == show_metadata_file.metadata_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_season_metadata_files = db.query(dm.ShowSeasonMetadataFile).options(sorm.joinedload(dm.ShowSeasonMetadataFile.metadata_file)).all()
        for show_season_metadata_file in show_season_metadata_files:
            if not show_season_metadata_file.metadata_file.local_path in existing_metadata_file_paths:
                db.query(dm.ShowSeasonMetadataFile).filter(
                    dm.ShowSeasonMetadataFile.show_season_id == show_season_metadata_file.show_season_id,
                    dm.ShowSeasonMetadataFile.metadata_file_id == show_season_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == show_season_metadata_file.metadata_file_id
                ).delete()
                purged_count += 1
        db.commit()

        show_episode_metadata_files = db.query(dm.ShowEpisodeMetadataFile).options(sorm.joinedload(dm.ShowEpisodeMetadataFile.metadata_file)).all()
        for show_episode_metadata_file in show_episode_metadata_files:
            if not show_episode_metadata_file.metadata_file.local_path in existing_metadata_file_paths:
                db.query(dm.ShowEpisodeMetadataFile).filter(
                    dm.ShowEpisodeMetadataFile.show_episode_id == show_episode_metadata_file.show_episode_id,
                    dm.ShowEpisodeMetadataFile.metadata_file_id == show_episode_metadata_file.metadata_file_id
                ).delete()
                db.query(dm.MetadataFile).filter(
                    dm.MetadataFile.id == show_episode_metadata_file.metadata_file_id
                ).delete()
                purged_count += 1
        db.commit()
    return purged_count