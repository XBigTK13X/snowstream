import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy import text as sql_text
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
        movies = db_movie.get_movie_list(ticket=ticket)
        for movie in movies:
            if not movie.video_files:
                results.append(movie.directory)

        episodes = db_episode.get_show_episode_list(ticket=ticket,include_specials=True)
        for episode in episodes:
            if not episode.video_files:
                results.append(episode.season.directory)
    return results

def purge_orphaned_records():
    results = []
    with DbSession() as db:
        kinds = ['metadata_file','image_file','video_file']
        for kind in kinds:
            file_query = f'''
                select
                    {kind}.id as file_id
                from {kind}
                    left join show_episode_{kind} on show_episode_{kind}.{kind}_id = {kind}.id
                    left join movie_{kind} on movie_{kind}.{kind}_id = {kind}.id
                    {'' if kind == 'video_file' else f'left join show_season_{kind} on show_season_{kind}.{kind}_id = {kind}.id'}
                    {'' if kind == 'video_file' else f'left join show_{kind} on show_{kind}.{kind}_id = {kind}.id'}
                where
                    show_episode_{kind}.id is null
                    and movie_{kind}.id is null
                    {'' if kind == 'video_file' else f'and show_{kind}.id is null'}
                    {'' if kind == 'video_file' else f'and show_season_{kind}.id is null'}
                    ;
            '''
            cursor = db.execute(sql_text(file_query))
            file_ids = []
            for row in cursor:
                results.append(f'{kind} - {row.file_id}')
                file_ids.append(str(row.file_id))
            if file_ids:
                group = ",".join(file_ids)
                db.execute(sql_text(f'delete from {kind} where {kind}.id in ({group});'))
                db.commit()

        episode_query = f'''
            select
                show_episode.id as episode_id
            from show_episode
                left join show_season on show_season.id = show_episode.show_season_id
            where
                show_season.id is null;
        '''
        episode_cursor = db.execute(sql_text(episode_query))
        episode_ids = []
        for row in episode_cursor:
            results.append(f'show_episode - {row.episode_id}')
            episode_ids.append(str(row.episode_id))
        if episode_ids:
            group = ",".join(episode_ids)
            db.execute(sql_text(f'delete from show_episode where show_episode.id in ({group});'))
            db.commit()

        season_query = f'''
            select
                show_season.id as season_id
            from show_season
                left join show on show.id = show_season.show_id
            where
                show.id is null;
        '''
        season_cursor = db.execute(sql_text(season_query))
        season_ids = []
        for row in season_cursor:
            results.append(f'show_season - {row.season_id}')
            season_ids.append(str(row.season_id))
        if season_ids:
            group = ",".join(season_ids)
            db.execute(sql_text(f'delete from show_season where show_season.id in ({group});'))
            db.commit()

        show_query = f'''
            select
                show.id as show_id
            from show
                left join show_shelf on show_shelf.show_id = show.id
                left join shelf on shelf.id = show_shelf.shelf_id
            where
                show_shelf.id is null
                or shelf.id is null;
        '''
        show_cursor = db.execute(sql_text(show_query))
        show_ids = []
        for row in show_cursor:
            results.append(f'show - {row.show_id}')
            show_ids.append(str(row.show_id))
        if show_ids:
            group = ",".join(show_ids)
            db.execute(sql_text(f'delete from show where show.id in ({group});'))
            db.commit()

        movie_query = f'''
            select
                movie.id as movie_id
            from movie
                left join movie_shelf on movie_shelf.movie_id = movie.id
                left join shelf on shelf.id = movie_shelf.shelf_id
            where
                movie_shelf.id is null
                or shelf.id is null;
        '''
        movie_cursor = db.execute(sql_text(movie_query))
        movie_ids = []
        for row in movie_cursor:
            results.append(f'movie - {row.movie_id}')
            movie_ids.append(str(row.movie_id))
        if movie_ids:
            group = ",".join(movie_ids)
            db.execute(sql_text(f'delete from movie where movie.id in ({group});'))
            db.commit()

    return results