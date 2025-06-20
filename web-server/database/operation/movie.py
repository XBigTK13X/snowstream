import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy import text as sql_text
from settings import config

def create_movie(name: str, release_year: int, directory: str):
    with DbSession() as db:
        dbm = dm.Movie()
        dbm.name = name
        dbm.release_year = release_year
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_movie_remote_metadata_id(movie_id:int, remote_metadata_id:int, remote_metadata_source:str='themoviedb'):
    with DbSession() as db:
        movie = db.query(dm.Movie).filter(dm.Movie.id == movie_id).first()
        movie.remote_metadata_id = remote_metadata_id
        movie.remote_metadata_source = remote_metadata_source
        db.commit()
        return movie

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
            .options(sorm.joinedload(dm.Movie.metadata_files))
            .options(sorm.joinedload(dm.Movie.shelf))
            .options(sorm.joinedload(dm.Movie.watch_count))
        )

        movie = query.first()
        if not ticket.is_allowed(shelf_id=movie.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=movie.get_tag_ids):
            return None
        movie = dm.set_primary_images(movie)
        if not movie.watch_count:
            movie.watch_count = dm.WatchCount()
            movie.watch_count.amount = 0
        return movie

def get_movie_by_name_and_year(name: str, release_year: int):
    with DbSession() as db:
        return (
            db.query(dm.Movie)
            .filter(dm.Movie.release_year == release_year)
            .filter(dm.Movie.name == name)
            .first()
        )

def get_movie_by_directory(directory:str):
    with DbSession() as db:
        return db.query(dm.Movie).filter(dm.Movie.directory == directory).first()

def get_movie_list_by_tag_id(ticket:dm.Ticket, tag_id):
    if not ticket.is_allowed(tag_id=tag_id):
        return None
    with DbSession() as db:
        movies = (
            db.query(dm.Movie)
            .join(dm.MovieShelf)
            .options(sorm.joinedload(dm.Movie.shelf))
            .options(sorm.joinedload(dm.Movie.tags))
            .order_by(dm.Movie.release_year)
            .all()
        )
        results = []
        for movie in movies:
            if tag_id in movie.get_tag_ids():
                movie = dm.set_primary_images(movie)
                results.append(movie)
        return results

def sql_row_to_api_result(row):
    movie = dm.Stub()
    movie.id = row.movie_id
    movie.name = row.movie_name
    movie.watched = row.movie_watched != None

    image_file = dm.Stub()
    image_file.id = row.image_id
    image_file.local_path = row.image_local_path
    image_file.web_path = row.image_web_path
    image_file.kind = row.image_kind
    image_file.thumbnail_web_path = row.image_thumbnail_web_path
    movie.image_files = [image_file]

    video_file = dm.Stub()
    video_file.id = row.video_id
    video_file.web_path = row.video_network_path
    video_file.ffprobe_pruned_json = row.video_ffprobe
    video_file.version = row.video_version
    movie.video_files = [video_file]

    metadata_file = dm.Stub()
    metadata_file.id = row.metadata_id
    metadata_file.local_path = row.metadata_local_path
    movie.metadata_files = [metadata_file]

    movie.shelf = dm.Stub()
    movie.shelf.id = row.shelf_id
    movie.shelf.name = row.shelf_name

    movie.tag = dm.Stub()
    movie.tag.id = row.tag_id
    movie.tag.name = row.tag_name
    movie.tags = [movie.tag]

    return movie

def get_movie_list_by_shelf(
    ticket:dm.Ticket,
    shelf_id:int = None,
    search_query:str = None,
    show_playlisted:bool = True,
    only_watched:bool = None,
    only_unwatched:bool = None
):
    if shelf_id != None and not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        watch_group = ','.join([str(xx) for xx in ticket.watch_group])
        if search_query:
            search_query = search_query.replace("'","''")
        raw_query = f'''
        select

        movie.id as movie_id,
        movie.name as movie_name,
        array_agg(watched.id) as movie_watched,

        shelf.id as shelf_id,
        shelf.name as shelf_name,

        array_agg(movie_image.id) as image_id,
        array_agg(movie_image.local_path) as image_local_path,
        array_agg(movie_image.web_path) as image_web_path,
        array_agg(movie_image.kind) as image_kind,
        array_agg(movie_image.thumbnail_web_path) as image_thumbnail_web_path,

        array_agg(movie_video.id) as video_id,
        array_agg(movie_video.network_path) as video_network_path,
        array_agg(movie_video.ffprobe_pruned_json) as video_ffprobe,
        array_agg(movie_video.version) as video_version,

        array_agg(movie_metadata.id) as metadata_id,
        array_agg(movie_metadata.local_path) as metadata_local_path,

        array_agg(tag.name) as tag_name,
        array_agg(tag.id) as tag_id

        from movie as movie
        join movie_shelf as ms on ms.movie_id = movie.id
            {f" and movie.name ilike '%{search_query}%'" if search_query else ''}
        join shelf as shelf on shelf.id = ms.shelf_id
            {f' and shelf.id = {shelf_id}' if shelf_id else ''}
        left join watched as watched on (
            watched.client_device_user_id in ({watch_group})
            and watched.shelf_id = shelf.id
            and (watched.movie_id is null or watched.movie_id = movie.id)
        )
        left join movie_image_file as mif on mif.movie_id = movie.id
        join image_file as movie_image on mif.image_file_id = movie_image.id
        left join movie_video_file as mvf on mvf.movie_id = movie.id
        join video_file as movie_video on mvf.video_file_id = movie_video.id
        left join movie_metadata_file as mmf on mmf.movie_id = movie.id
        join metadata_file as movie_metadata on mmf.metadata_file_id = movie_metadata.id
        left join movie_tag as mt on mt.movie_id = movie.id
        join tag as tag on tag.id = mt.tag_id
        where 1=1
            {f" and watched.id is null" if only_unwatched else ''}
            {f" and watched.id is not null" if only_watched else ''}
        group by
            movie.id,
            movie.name,
            shelf.id,
            shelf.name
        order by
            movie.name
        {f'limit {config.search_results_per_shelf_limit}' if search_query else ''}
        '''

        cursor = db.execute(sql_text(raw_query))
        log.info("DEBUG -- Cursor generated movies")
        dedupe_ep = {}
        dedupe_images = {}
        dedupe_metadata = {}
        dedupe_video = {}
        dedupe_tag = {}
        results = []
        log.info("DEBUG -- Deduplicating results")
        raw_result_count = 0
        for xx in cursor:
            raw_result_count += 1
            model = sql_row_to_api_result(row=xx)
            is_dupe_movie = False
            if not model.id in dedupe_ep:
                if len(results) > 0:
                    results[-1] = dm.set_primary_images(results[-1])
                dedupe_ep[model.id] = True
                results.append(model)
            else:
                is_dupe_movie = True
            image_key = model.image_files[0].id
            if model.image_files and not image_key in dedupe_images:
                dedupe_images[image_key] = True
                if is_dupe_movie:
                    results[-1].image_files.append(model.image_files[0])
            video_key = model.video_files[0].id
            if model.video_files and not video_key in dedupe_video:
                dedupe_video[video_key] = True
                if is_dupe_movie:
                    results[-1].video_files.append(model.video_files[0])
            metadata_key = model.metadata_files[0].id
            if model.metadata_files and not metadata_key in dedupe_metadata:
                dedupe_metadata[metadata_key] = True
                if is_dupe_movie:
                    results[-1].metadata_files.append(model.metadata_files[0])
            tag_key = f'{model.id}-{model.tags[0].id}'
            if model.tags and not tag_key in dedupe_tag:
                dedupe_tag[tag_key] = True
                if is_dupe_movie:
                    results[-1].tags.append(model.tags[0])
        log.info(f"DEBUG -- Handling return conditions for {raw_result_count} raw items")
        if len(results) > 0:
            results[-1] = dm.set_primary_images(results[-1])
        return results

        if search_query:
            query = query.filter(dm.Movie.name.ilike(f'%{search_query}%'))
        query = query.options(sorm.joinedload(dm.Movie.tags))
        if shelf_id != None:
            query = query.filter(dm.MovieShelf.shelf_id == shelf_id)
        query = query.order_by(dm.Movie.name)
        if search_query:
            query = query.limit(config.search_results_per_shelf_limit)
        movies = query.all()
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id.in_(ticket.watch_group),
                dm.Watched.shelf_id == shelf_id
            ).all()
        )
        all_watched = False
        watch_lookup = {}
        for watch in watched:
            if watch.shelf_id and not watch.movie_id:
                all_watched = True
                break
            watch_lookup[watch.movie_id] = True
        results = []
        for movie in movies:
            if not movie.video_files:
                continue
            if not ticket.is_allowed(tag_provider=movie.get_tag_ids):
                continue
            if not show_playlisted and any('Playlist:' in xx.name for xx in movie.tags):
                continue
            movie = dm.set_primary_images(movie)
            if all_watched or movie.id in watch_lookup:
                movie.watched = True
            else:
                movie.watched = False
            results.append(movie)
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
            return True
        return False

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


def set_movie_watched(ticket:dm.Ticket, movie_id:int, is_watched:bool=True):
    with DbSession() as db:
        movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
        if not movie:
            return False
        shelf_id = movie.shelf.id
        shelf_watched = get_movie_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        movies = get_movie_list_by_shelf(ticket=ticket,shelf_id=shelf_id)
        if not movies:
            return False
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.movie_id == movie_id
        ).delete()
        db.commit()
        if is_watched and not shelf_watched:
            watched_movies = [xx for xx in movies if xx.watched]
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
    is_watched = False
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
            is_watched = True
        else:
            dbm = dm.WatchProgress()
            dbm.client_device_user_id = ticket.cduid
            dbm.movie_id = watch_progress.movie_id
            dbm.duration_seconds = watch_progress.duration_seconds
            dbm.played_seconds = watch_progress.played_seconds
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
    return is_watched

def make_movie_watch_count(cduid:int,movie_id):
    dbm = dm.WatchCount()
    dbm.amount = 1
    dbm.client_device_user_id = cduid
    dbm.movie_id = movie_id
    return dbm


def increase_movie_watch_count(ticket:dm.Ticket,movie_id:int):
    movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
    if not movie:
        return False
    with DbSession() as db:
        existing_count = (
            db.query(dm.WatchCount)
            .filter(
                dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dm.WatchCount.movie_id == movie_id
            ).first()
        )
        if existing_count:
            existing_count.amount += 1
            db.commit()
            return existing_count
        else:
            new_count = make_movie_watch_count(cduid=ticket.cduid,movie_id=movie_id)
            db.add(new_count)
            db.commit()
            return new_count


def reset_movie_watch_count(ticket:dm.Ticket,movie_id:int):
    with DbSession as db:
        (
            db.query(dm.WatchCount)
            .filter(
                dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dm.WatchCount.movie_id == movie_id
            ).delete()
        )
        db.commit()
        return True

def get_unknown_movie_list(shelf_id:int=None):
    with DbSession() as db:
        query = (
            db.query(dm.Movie)
            .options(sorm.joinedload(dm.Movie.image_files))
            .options(sorm.joinedload(dm.Movie.metadata_files))
        )
        if shelf_id:
            query = query.join(dm.MovieShelf).filter(dm.MovieShelf.shelf_id == shelf_id)
        query = query.filter(dm.Movie.remote_metadata_id == None)
        movies = query.all()
        results = []
        for movie in movies:
            if not movie.image_files or not movie.metadata_files:
                results.append(movie)
        return results
