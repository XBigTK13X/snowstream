from database.operation.db_internal import dbi
import database.operation.movie as db_movie
import database.operation.show_episode as db_episode


def _purge_missing_files_by_model(file_model, assoc_models):
    deleted_records = []
    with dbi.session() as db:
        records = db.query(file_model.id, file_model.local_path).all()
        missing_ids = []
        for file_record in records:
            if not dbi.os.path.exists(file_record.local_path):
                deleted_records.append(file_record.local_path)
                missing_ids.append(file_record.id)

        if missing_ids:
            for assoc_model in assoc_models:
                assoc_field = getattr(assoc_model, f"{file_model.__tablename__}_id")
                db.query(assoc_model).filter(assoc_field.in_(missing_ids)).delete(
                    synchronize_session=False
                )

            db.query(file_model).filter(file_model.id.in_(missing_ids)).delete(
                synchronize_session=False
            )
            db.commit()

    return deleted_records


def purge_missing_video_file_records():
    assoc_models = [
        dbi.dm.MovieVideoFile,
        dbi.dm.ShowEpisodeVideoFile,
        dbi.dm.KeepsakeVideoFile,
    ]
    return _purge_missing_files_by_model(dbi.dm.VideoFile, assoc_models)


def purge_missing_image_file_records():
    assoc_models = [
        dbi.dm.MovieImageFile,
        dbi.dm.ShowImageFile,
        dbi.dm.ShowSeasonImageFile,
        dbi.dm.ShowEpisodeImageFile,
        dbi.dm.KeepsakeImageFile,
    ]
    return _purge_missing_files_by_model(dbi.dm.ImageFile, assoc_models)


def purge_missing_metadata_file_records():
    assoc_models = [
        dbi.dm.MovieMetadataFile,
        dbi.dm.ShowMetadataFile,
        dbi.dm.ShowSeasonMetadataFile,
        dbi.dm.ShowEpisodeMetadataFile,
    ]
    return _purge_missing_files_by_model(dbi.dm.MetadataFile, assoc_models)


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
        kinds = ["metadata_file", "image_file", "video_file"]
        for kind in kinds:
            file_query = f"""
                select
                    {kind}.id as file_id
                from {kind}
                    left join show_episode_{kind} on show_episode_{kind}.{kind}_id = {kind}.id
                    left join movie_{kind} on movie_{kind}.{kind}_id = {kind}.id
                    {"" if kind == "video_file" else f"left join show_season_{kind} on show_season_{kind}.{kind}_id = {kind}.id"}
                    {"" if kind == "video_file" else f"left join show_{kind} on show_{kind}.{kind}_id = {kind}.id"}
                    {"" if kind == "metadata_file" else f"left join keepsake_{kind} on keepsake_{kind}.{kind}_id = {kind}.id"}
                where
                    show_episode_{kind}.id is null
                    and movie_{kind}.id is null
                    {"" if kind == "video_file" else f"and show_{kind}.id is null"}
                    {"" if kind == "video_file" else f"and show_season_{kind}.id is null"}
                    {"" if kind == "metadata_file" else f"and keepsake_{kind}.id is null"}
                    ;
            """
            cursor = db.execute(dbi.sql_text(file_query))
            file_ids = [str(row.file_id) for row in cursor]
            for file_id in file_ids:
                results.append(f"{kind} - {file_id}")

            if file_ids:
                group = ",".join(file_ids)
                db.execute(
                    dbi.sql_text(f"delete from {kind} where {kind}.id in ({group});")
                )
                db.commit()

        episode_query = """
            select
                show_episode.id as episode_id
            from show_episode
                left join show_season on show_season.id = show_episode.show_season_id
            where
                show_season.id is null;
        """
        episode_cursor = db.execute(dbi.sql_text(episode_query))
        episode_ids = [str(row.episode_id) for row in episode_cursor]
        for episode_id in episode_ids:
            results.append(f"show_episode - {episode_id}")

        if episode_ids:
            group = ",".join(episode_ids)
            db.execute(
                dbi.sql_text(
                    f"delete from show_episode where show_episode.id in ({group});"
                )
            )
            db.commit()

        season_query = """
            select
                show_season.id as season_id
            from show_season
                left join show on show.id = show_season.show_id
            where
                show.id is null;
        """
        season_cursor = db.execute(dbi.sql_text(season_query))
        season_ids = [str(row.season_id) for row in season_cursor]
        for season_id in season_ids:
            results.append(f"show_season - {season_id}")

        if season_ids:
            group = ",".join(season_ids)
            db.execute(
                dbi.sql_text(
                    f"delete from show_season where show_season.id in ({group});"
                )
            )
            db.commit()

        show_query = """
            select
                show.id as show_id
            from show
                left join show_shelf on show_shelf.show_id = show.id
                left join shelf on shelf.id = show_shelf.shelf_id
            where
                show_shelf.id is null
                or shelf.id is null;
        """
        show_cursor = db.execute(dbi.sql_text(show_query))
        show_ids = [str(row.show_id) for row in show_cursor]
        for show_id in show_ids:
            results.append(f"show - {show_id}")

        if show_ids:
            group = ",".join(show_ids)
            db.execute(dbi.sql_text(f"delete from show where show.id in ({group});"))
            db.commit()

        movie_query = """
            select
                movie.id as movie_id
            from movie
                left join movie_shelf on movie_shelf.movie_id = movie.id
                left join shelf on shelf.id = movie_shelf.shelf_id
            where
                movie_shelf.id is null
                or shelf.id is null;
        """
        movie_cursor = db.execute(dbi.sql_text(movie_query))
        movie_ids = [str(row.movie_id) for row in movie_cursor]
        for movie_id in movie_ids:
            results.append(f"movie - {movie_id}")

        if movie_ids:
            group = ",".join(movie_ids)
            db.execute(dbi.sql_text(f"delete from movie where movie.id in ({group});"))
            db.commit()

        keepsake_query = """
            select
                parent_keepsake.id as keepsake_id
            from keepsake as parent_keepsake
                left join keepsake_video_file on keepsake_video_file.keepsake_id = parent_keepsake.id
                left join keepsake_image_file on keepsake_image_file.keepsake_id = parent_keepsake.id
                left join keepsake as child_keepsake on child_keepsake.id != parent_keepsake.id
                    and child_keepsake.directory like parent_keepsake.directory || '/%'
            where
                keepsake_video_file.id is null
                and keepsake_image_file.id is null
                and child_keepsake.id is null;
        """
        keepsake_cursor = db.execute(dbi.sql_text(keepsake_query))
        keepsake_ids = [str(row.keepsake_id) for row in keepsake_cursor]
        for keepsake_id in keepsake_ids:
            results.append(f"keepsake - {keepsake_id}")

        if keepsake_ids:
            group = ",".join(keepsake_ids)
            db.execute(
                dbi.sql_text(
                    f"delete from keepsake_shelf where keepsake_id in ({group});"
                )
            )
            db.execute(
                dbi.sql_text(f"delete from keepsake where keepsake.id in ({group});")
            )
            db.commit()

    return results
