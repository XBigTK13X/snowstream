from database.operation.db_internal import dbi
import database.operation.movie as db_movie
import database.operation.show_episode as db_episode

def purge_missing_video_file_records():
    deleted_records = []
    with dbi.session() as db:
        movie_video_files = db.query(dbi.dm.MovieVideoFile).options(dbi.orm.joinedload(dbi.dm.MovieVideoFile.video_file)).all()
        for movie_video_file in movie_video_files:
            if not dbi.os.path.exists(movie_video_file.video_file.local_path):
                deleted_records.append(movie_video_file.video_file.local_path)
                db.query(dbi.dm.MovieVideoFile).filter(
                    dbi.dm.MovieVideoFile.movie_id == movie_video_file.movie_id,
                    dbi.dm.MovieVideoFile.video_file_id == movie_video_file.video_file_id
                ).delete()
                db.query(dbi.dm.VideoFile).filter(
                    dbi.dm.VideoFile.id == movie_video_file.video_file_id
                ).delete()
        db.commit()

        show_episode_video_files = db.query(dbi.dm.ShowEpisodeVideoFile).options(dbi.orm.joinedload(dbi.dm.ShowEpisodeVideoFile.video_file)).all()
        for show_episode_video_file in show_episode_video_files:
            if not dbi.os.path.exists(show_episode_video_file.video_file.local_path):
                deleted_records.append(show_episode_video_file.video_file.local_path)
                db.query(dbi.dm.ShowEpisodeVideoFile).filter(
                    dbi.dm.ShowEpisodeVideoFile.show_episode_id == show_episode_video_file.show_episode_id,
                    dbi.dm.ShowEpisodeVideoFile.video_file_id == show_episode_video_file.video_file_id
                ).delete()
                db.query(dbi.dm.VideoFile).filter(
                    dbi.dm.VideoFile.id == show_episode_video_file.video_file_id
                ).delete()
        db.commit()

        keepsake_video_files = db.query(dbi.dm.KeepsakeVideoFile).options(dbi.orm.joinedload(dbi.dm.KeepsakeVideoFile.video_file)).all()
        for keepsake_video_file in keepsake_video_files:
            if not dbi.os.path.exists(keepsake_video_file.video_file.local_path):
                deleted_records.append(keepsake_video_file.video_file.local_path)
                db.query(dbi.dm.KeepsakeVideoFile).filter(
                    dbi.dm.KeepsakeVideoFile.keepsake_id == keepsake_video_file.keepsake_id,
                    dbi.dm.KeepsakeVideoFile.video_file_id == keepsake_video_file.video_file_id
                ).delete()
                db.query(dbi.dm.VideoFile).filter(
                    dbi.dm.VideoFile.id == keepsake_video_file.video_file_id
                ).delete()
        db.commit()

    return deleted_records

def purge_missing_image_file_records():
    deleted_records = []
    with dbi.session() as db:
        movie_image_files = db.query(dbi.dm.MovieImageFile).options(dbi.orm.joinedload(dbi.dm.MovieImageFile.image_file)).all()
        for movie_image_file in movie_image_files:
            if not dbi.os.path.exists(movie_image_file.image_file.local_path):
                deleted_records.append(movie_image_file.image_file.local_path)
                db.query(dbi.dm.MovieImageFile).filter(
                    dbi.dm.MovieImageFile.movie_id == movie_image_file.movie_id,
                    dbi.dm.MovieImageFile.image_file_id == movie_image_file.image_file_id
                ).delete()
                db.query(dbi.dm.ImageFile).filter(
                    dbi.dm.ImageFile.id == movie_image_file.image_file_id
                ).delete()
        db.commit()

        show_image_files = db.query(dbi.dm.ShowImageFile).options(dbi.orm.joinedload(dbi.dm.ShowImageFile.image_file)).all()
        for show_image_file in show_image_files:
            if not dbi.os.path.exists(show_image_file.image_file.local_path):
                deleted_records.append(show_image_file.image_file.local_path)
                db.query(dbi.dm.ShowImageFile).filter(
                    dbi.dm.ShowImageFile.show_id == show_image_file.show_id,
                    dbi.dm.ShowImageFile.image_file_id == show_image_file.image_file_id
                ).delete()
                db.query(dbi.dm.ImageFile).filter(
                    dbi.dm.ImageFile.id == show_image_file.image_file_id
                ).delete()
        db.commit()

        show_season_image_files = db.query(dbi.dm.ShowSeasonImageFile).options(dbi.orm.joinedload(dbi.dm.ShowSeasonImageFile.image_file)).all()
        for show_season_image_file in show_season_image_files:
            if not dbi.os.path.exists(show_season_image_file.image_file.local_path):
                deleted_records.append(show_season_image_file.image_file.local_path)
                db.query(dbi.dm.ShowSeasonImageFile).filter(
                    dbi.dm.ShowSeasonImageFile.show_season_id == show_season_image_file.show_season_id,
                    dbi.dm.ShowSeasonImageFile.image_file_id == show_season_image_file.image_file_id
                ).delete()
                db.query(dbi.dm.ImageFile).filter(
                    dbi.dm.ImageFile.id == show_season_image_file.image_file_id
                ).delete()
        db.commit()

        show_episode_image_files = db.query(dbi.dm.ShowEpisodeImageFile).options(dbi.orm.joinedload(dbi.dm.ShowEpisodeImageFile.image_file)).all()
        for show_episode_image_file in show_episode_image_files:
            if not dbi.os.path.exists(show_episode_image_file.image_file.local_path):
                deleted_records.append(show_episode_image_file.image_file.local_path)
                db.query(dbi.dm.ShowEpisodeImageFile).filter(
                    dbi.dm.ShowEpisodeImageFile.show_episode_id == show_episode_image_file.show_episode_id,
                    dbi.dm.ShowEpisodeImageFile.image_file_id == show_episode_image_file.image_file_id
                ).delete()
                db.query(dbi.dm.ImageFile).filter(
                    dbi.dm.ImageFile.id == show_episode_image_file.image_file_id
                ).delete()
        db.commit()

        keepsake_image_files = db.query(dbi.dm.KeepsakeImageFile).options(dbi.orm.joinedload(dbi.dm.KeepsakeImageFile.image_file)).all()
        for keepsake_image_file in keepsake_image_files:
            if not dbi.os.path.exists(keepsake_image_file.image_file.local_path):
                deleted_records.append(keepsake_image_file.image_file.local_path)
                db.query(dbi.dm.KeepsakeImageFile).filter(
                    dbi.dm.KeepsakeImageFile.keepsake_id == keepsake_image_file.keepsake_id,
                    dbi.dm.KeepsakeImageFile.image_file_id == keepsake_image_file.image_file_id
                ).delete()
                db.query(dbi.dm.ImageFile).filter(
                    dbi.dm.ImageFile.id == keepsake_image_file.image_file_id
                ).delete()
        db.commit()

    return deleted_records

def purge_missing_metadata_file_records():
    deleted_records = []
    with dbi.session() as db:
        movie_metadata_files = db.query(dbi.dm.MovieMetadataFile).options(dbi.orm.joinedload(dbi.dm.MovieMetadataFile.metadata_file)).all()
        for movie_metadata_file in movie_metadata_files:
            if not dbi.os.path.exists(movie_metadata_file.metadata_file.local_path):
                deleted_records.append(movie_metadata_file.metadata_file.local_path)
                db.query(dbi.dm.MovieMetadataFile).filter(
                    dbi.dm.MovieMetadataFile.movie_id == movie_metadata_file.movie_id,
                    dbi.dm.MovieMetadataFile.metadata_file_id == movie_metadata_file.metadata_file_id
                ).delete()
                db.query(dbi.dm.MetadataFile).filter(
                    dbi.dm.MetadataFile.id == movie_metadata_file.metadata_file_id
                ).delete()
        db.commit()

        show_metadata_files = db.query(dbi.dm.ShowMetadataFile).options(dbi.orm.joinedload(dbi.dm.ShowMetadataFile.metadata_file)).all()
        for show_metadata_file in show_metadata_files:
            if not dbi.os.path.exists(show_metadata_file.metadata_file.local_path):
                deleted_records.append(show_metadata_file.metadata_file.local_path)
                db.query(dbi.dm.ShowMetadataFile).filter(
                    dbi.dm.ShowMetadataFile.show_id == show_metadata_file.show_id,
                    dbi.dm.ShowMetadataFile.metadata_file_id == show_metadata_file.metadata_file_id
                ).delete()
                db.query(dbi.dm.MetadataFile).filter(
                    dbi.dm.MetadataFile.id == show_metadata_file.metadata_file_id
                ).delete()
        db.commit()

        show_season_metadata_files = db.query(dbi.dm.ShowSeasonMetadataFile).options(dbi.orm.joinedload(dbi.dm.ShowSeasonMetadataFile.metadata_file)).all()
        for show_season_metadata_file in show_season_metadata_files:
            if not dbi.os.path.exists(show_season_metadata_file.metadata_file.local_path):
                deleted_records.append(show_season_metadata_file.metadata_file.local_path)
                db.query(dbi.dm.ShowSeasonMetadataFile).filter(
                    dbi.dm.ShowSeasonMetadataFile.show_season_id == show_season_metadata_file.show_season_id,
                    dbi.dm.ShowSeasonMetadataFile.metadata_file_id == show_season_metadata_file.metadata_file_id
                ).delete()
                db.query(dbi.dm.MetadataFile).filter(
                    dbi.dm.MetadataFile.id == show_season_metadata_file.metadata_file_id
                ).delete()
        db.commit()

        show_episode_metadata_files = db.query(dbi.dm.ShowEpisodeMetadataFile).options(dbi.orm.joinedload(dbi.dm.ShowEpisodeMetadataFile.metadata_file)).all()
        for show_episode_metadata_file in show_episode_metadata_files:
            if not dbi.os.path.exists(show_episode_metadata_file.metadata_file.local_path):
                deleted_records.append(show_episode_metadata_file.metadata_file.local_path)
                db.query(dbi.dm.ShowEpisodeMetadataFile).filter(
                    dbi.dm.ShowEpisodeMetadataFile.show_episode_id == show_episode_metadata_file.show_episode_id,
                    dbi.dm.ShowEpisodeMetadataFile.metadata_file_id == show_episode_metadata_file.metadata_file_id
                ).delete()
                db.query(dbi.dm.MetadataFile).filter(
                    dbi.dm.MetadataFile.id == show_episode_metadata_file.metadata_file_id
                ).delete()
        db.commit()
    return deleted_records

def purge_shelf_content_without_video_files():
    results = []
    with dbi.session() as db:
        movies = db_movie.delete_movies_without_videos()
        if movies:
            results += movies

        episodes = db_episode.delete_show_episodes_without_videos()
        if episodes:
            results += episodes


    return results

def purge_orphaned_records():
    results = []
    with dbi.session() as db:
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
                    {'' if kind == 'metadata_file' else f'left join keepsake_{kind} on keepsake_{kind}.{kind}_id = {kind}.id'}
                where
                    show_episode_{kind}.id is null
                    and movie_{kind}.id is null
                    {'' if kind == 'video_file' else f'and show_{kind}.id is null'}
                    {'' if kind == 'video_file' else f'and show_season_{kind}.id is null'}
                    {'' if kind == 'metadata_file' else f'and keepsake_{kind}.id is null'}
                    ;
            '''
            cursor = db.execute(dbi.sql_text(file_query))
            file_ids = []
            for row in cursor:
                results.append(f'{kind} - {row.file_id}')
                file_ids.append(str(row.file_id))
            if file_ids:
                group = ",".join(file_ids)
                db.execute(dbi.sql_text(f'delete from {kind} where {kind}.id in ({group});'))
                db.commit()

        episode_query = f'''
            select
                show_episode.id as episode_id
            from show_episode
                left join show_season on show_season.id = show_episode.show_season_id
            where
                show_season.id is null;
        '''
        episode_cursor = db.execute(dbi.sql_text(episode_query))
        episode_ids = []
        for row in episode_cursor:
            results.append(f'show_episode - {row.episode_id}')
            episode_ids.append(str(row.episode_id))
        if episode_ids:
            group = ",".join(episode_ids)
            db.execute(dbi.sql_text(f'delete from show_episode where show_episode.id in ({group});'))
            db.commit()

        season_query = f'''
            select
                show_season.id as season_id
            from show_season
                left join show on show.id = show_season.show_id
            where
                show.id is null;
        '''
        season_cursor = db.execute(dbi.sql_text(season_query))
        season_ids = []
        for row in season_cursor:
            results.append(f'show_season - {row.season_id}')
            season_ids.append(str(row.season_id))
        if season_ids:
            group = ",".join(season_ids)
            db.execute(dbi.sql_text(f'delete from show_season where show_season.id in ({group});'))
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
        show_cursor = db.execute(dbi.sql_text(show_query))
        show_ids = []
        for row in show_cursor:
            results.append(f'show - {row.show_id}')
            show_ids.append(str(row.show_id))
        if show_ids:
            group = ",".join(show_ids)
            db.execute(dbi.sql_text(f'delete from show where show.id in ({group});'))
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
        movie_cursor = db.execute(dbi.sql_text(movie_query))
        movie_ids = []
        for row in movie_cursor:
            results.append(f'movie - {row.movie_id}')
            movie_ids.append(str(row.movie_id))
        if movie_ids:
            group = ",".join(movie_ids)
            db.execute(dbi.sql_text(f'delete from movie where movie.id in ({group});'))
            db.commit()

    return results