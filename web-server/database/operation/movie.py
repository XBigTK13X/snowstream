from database.operation.db_internal import dbi
import api_models as am
def create_movie(name: str, release_year: int, directory: str):
    with dbi.session() as db:
        dbm = dbi.dm.Movie()
        dbm.name = name
        dbm.release_year = release_year
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_movie_remote_metadata_id(movie_id:int, remote_metadata_id:int, remote_metadata_source:str='themoviedb'):
    with dbi.session() as db:
        movie = db.query(dbi.dm.Movie).filter(dbi.dm.Movie.id == movie_id).first()
        movie.remote_metadata_id = remote_metadata_id
        movie.remote_metadata_source = remote_metadata_source
        db.commit()
        return movie

def add_movie_to_shelf(movie_id: int, shelf_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.MovieShelf()
        dbm.shelf_id = shelf_id
        dbm.movie_id = movie_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_by_id(ticket:dbi.dm.Ticket,movie_id: int):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Movie)
            .filter(dbi.dm.Movie.id == movie_id)
            .options(dbi.orm.joinedload(dbi.dm.Movie.shelf))
            .options(dbi.orm.joinedload(dbi.dm.Movie.video_files))
            .options(dbi.orm.joinedload(dbi.dm.Movie.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Movie.metadata_files))
            .options(dbi.orm.joinedload(dbi.dm.Movie.shelf))
            .options(dbi.orm.joinedload(dbi.dm.Movie.watch_count))
            .options(dbi.orm.joinedload(dbi.dm.Movie.in_progress))
        )

        movie = query.first()
        if not movie:
            return None
        if not ticket.is_allowed(shelf_id=movie.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=movie.get_tag_ids):
            return None
        movie = dbi.dm.set_primary_images(movie)
        if not movie.watch_count:
            movie.watch_count = dbi.dm.WatchCount()
            movie.watch_count.amount = 0
        return movie

def get_movie_by_name_and_year(name: str, release_year: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Movie)
            .filter(dbi.dm.Movie.release_year == release_year)
            .filter(dbi.dm.Movie.name == name)
            .first()
        )

def get_movie_by_directory(directory:str):
    with dbi.session() as db:
        return db.query(dbi.dm.Movie).filter(dbi.dm.Movie.directory == directory).first()

def get_movie_list_by_tag_id(ticket:dbi.dm.Ticket, tag_id):
    with dbi.session() as db:
        movies = (
            db.query(dbi.dm.Movie)
            .join(dbi.dm.MovieShelf)
            .options(dbi.orm.joinedload(dbi.dm.Movie.shelf))
            .options(dbi.orm.joinedload(dbi.dm.Movie.tags))
            .options(dbi.orm.joinedload(dbi.dm.Movie.watch_count))
            .order_by(dbi.dm.Movie.release_year)
            .all()
        )
        results = []
        for movie in movies:
            if not ticket.is_allowed(tag_provider=movie.get_tag_ids):
                continue
            if tag_id in movie.get_tag_ids():
                movie = dbi.dm.set_primary_images(movie)
                results.append(movie)
        return results

def sql_row_to_api_result(row,load_files,watch_group):
    movie = dbi.dm.Stub()
    movie.model_kind = 'movie'
    movie.id = row.movie_id
    movie.name = row.movie_name
    if watch_group:
        movie.watched = bool(row.movie_watched_list)

    movie.shelf = dbi.dm.Stub()
    movie.shelf.id = row.shelf_id
    movie.shelf.name = row.shelf_name

    movie.image_files = []
    movie.video_files = []
    movie.metadata_files = []
    screencap_is_meta = False
    poster_is_meta = False
    movie.poster_image = None
    movie.screencap_image = None
    movie.has_images = False
    dedupe = {}
    for ii in range(0,len(row.image_id_list)):
        if row.image_id_list[ii] == None:
                continue
        movie.has_images = True
        if f'i-{row.image_local_path_list[ii]}' in dedupe:
            continue
        dedupe[f'i-{row.image_local_path_list[ii]}'] = 1
        image_file = dbi.dm.Stub()
        image_file.model_kind = 'image_file'
        image_file.id = row.image_id_list[ii]
        image_file.local_path = row.image_local_path_list[ii]
        image_file.web_path = row.image_web_path_list[ii]
        image_file.kind = row.image_kind_list[ii]
        image_file.thumbnail_web_path = row.image_thumbnail_web_path_list[ii]
        if not movie.screencap_image or screencap_is_meta:
            if not movie.poster_image or poster_is_meta:
                if 'poster' in image_file.kind:
                    movie.poster_image = image_file
                    poster_is_meta = '/metadata/' in image_file.local_path
            if 'screencap' in image_file.kind:
                movie.screencap_image = image_file
                screencap_is_meta = '/metadata/' in image_file.local_path
        if load_files:
            movie.image_files.append(image_file)


    if load_files:
        for ii in range(0,len(row.video_id_list)):
            if row.video_id_list[ii] == None:
                continue
            if f'v-{row.video_id_list[ii]}' in dedupe:
                continue
            dedupe[f'v-{row.video_id_list[ii]}'] = 1
            video_file = dbi.dm.Stub()
            video_file.model_kind = 'video_file'
            video_file.id = row.video_id_list[ii]
            video_file.kind = row.video_kind_list[ii]
            video_file.web_path = row.video_network_path_list[ii]
            video_file.local_path = row.video_local_path_list[ii]
            video_file.snowstream_info_json = row.video_info_list[ii]
            video_file.version = row.video_version_list[ii]
            movie.video_files.append(video_file)

        for ii in range(0,len(row.metadata_id_list)):
            if row.metadata_id_list[ii] == None:
                continue
            if f'm-{row.metadata_id_list[ii]}' in dedupe:
                continue
            dedupe[f'm-{row.metadata_id_list[ii]}'] = 1
            metadata_file = dbi.dm.Stub()
            metadata_file.model_kind = 'metadata_file'
            metadata_file.id = row.metadata_id_list[ii]
            metadata_file.kind = row.metadata_kind_list[ii]
            metadata_file.xml_content = row.metadata_xml_content_list[ii]
            metadata_file.local_path = row.metadata_local_path_list[ii]
            movie.metadata_files.append(metadata_file)

    movie.tags = []
    movie.tag_ids = []
    movie.tag_names = []
    tag_dedupe = {}
    for ii in range(0,len(row.tag_id_list)):
        if row.tag_id_list[ii] == None:
            continue
        tag = dbi.dm.Stub()
        if row.tag_id_list[ii] in tag_dedupe:
            continue
        tag.id = row.tag_id_list[ii]
        movie.tag_ids.append(tag.id)
        tag.name = row.tag_name_list[ii]
        movie.tag_names.append(tag.name)
        movie.tags.append(tag)
        tag_dedupe[row.tag_id_list[ii]] = True

    return movie

def get_movie_list(
    ticket:dbi.dm.Ticket,
    shelf_id:int = None,
    search_query:str = None,
    show_playlisted:bool = True,
    load_files:bool = True,
    only_watched:bool = None,
    only_unwatched:bool = None
):
    if shelf_id != None and not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with dbi.session() as db:
        watch_group = None
        if ticket.watch_group:
            watch_group = ','.join([str(xx) for xx in ticket.watch_group])
        if search_query:
            search_query = search_query.replace("'","''")
        raw_query = f'''
        select

        movie.id as movie_id,
        movie.name as movie_name,
        {'array_remove(array_agg(watched.id),NULL) as movie_watched_list,' if watch_group else ''}

        shelf.id as shelf_id,
        shelf.name as shelf_name,

        array_agg(movie_image.id) as image_id_list,
        array_agg(movie_image.local_path) as image_local_path_list,
        array_agg(movie_image.web_path) as image_web_path_list,
        array_agg(movie_image.kind) as image_kind_list,
        array_agg(movie_image.thumbnail_web_path) as image_thumbnail_web_path_list,

        {"""
        array_agg(movie_video.id) as video_id_list,
        array_agg(movie_video.kind) as video_kind_list,
        array_agg(movie_video.local_path) as video_local_path_list,
        array_agg(movie_video.network_path) as video_network_path_list,
        array_agg(movie_video.snowstream_info_json) as video_info_list,
        array_agg(movie_video.version) as video_version_list,

        array_agg(movie_metadata.id) as metadata_id_list,
        array_agg(movie_metadata.kind) as metadata_kind_list,
        array_agg(movie_metadata.local_path) as metadata_local_path_list,
        array_agg(movie_metadata.xml_content) as metadata_xml_content_list,
        """ if load_files else ""}

        array_remove(array_agg(tag.name),NULL) as tag_name_list,
        array_remove(array_agg(tag.id),NULL) as tag_id_list

        from movie as movie
        join movie_shelf as ms on ms.movie_id = movie.id
            {f" and movie.name ilike '%{search_query}%'" if search_query else ''}
        join shelf as shelf on shelf.id = ms.shelf_id
            {f' and shelf.id = {shelf_id}' if shelf_id else ''}
        {f"""
        left join watched as watched on (
            watched.client_device_user_id in ({watch_group})
            and watched.movie_id = movie.id
        )
        left join movie_image_file as mif on mif.movie_id = movie.id
        left join image_file as movie_image on mif.image_file_id = movie_image.id
        """ if watch_group else ""}
        {"""
        left join movie_video_file as mvf on mvf.movie_id = movie.id
        left join video_file as movie_video on mvf.video_file_id = movie_video.id
        left join movie_metadata_file as mmf on mmf.movie_id = movie.id
        left join metadata_file as movie_metadata on mmf.metadata_file_id = movie_metadata.id
        """ if load_files else ""}
        left join movie_tag as mt on mt.movie_id = movie.id
        left join tag as tag on tag.id = mt.tag_id
        where 1=1
            {f" and watched.id is null" if only_unwatched and watch_group else ''}
            {f" and watched.id is not null" if only_watched and watch_group else ''}
        group by
            shelf.id,
            shelf.name,
            movie.id,
            movie.name
        order by
            movie.name
        {f'limit {dbi.config.search_results_per_shelf_limit}' if search_query else ''}
        '''

        cursor = db.execute(dbi.sql_text(raw_query))
        results = []
        raw_result_count = 0
        for xx in cursor:
            raw_result_count += 1
            model = sql_row_to_api_result(
                row=xx,
                load_files=load_files,
                watch_group=watch_group
            )
            if not model.has_images:
                continue
            if not ticket.is_allowed(tag_ids=model.tag_ids):
                continue
            if show_playlisted == False and any('Playlist:' in xx for xx in model.tag_names):
                continue
            results.append(model)

        return results

def create_movie_video_file(movie_id: int, video_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.MovieVideoFile()
        dbm.movie_id = movie_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_video_file(movie_id: int, video_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.MovieVideoFile)
            .filter(dbi.dm.MovieVideoFile.movie_id == movie_id)
            .filter(dbi.dm.MovieVideoFile.video_file_id == video_file_id)
            .first()
        )

def create_movie_image_file(movie_id: int, image_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.MovieImageFile()
        dbm.movie_id = movie_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_image_file(movie_id: int, image_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.MovieImageFile)
            .filter(dbi.dm.MovieImageFile.movie_id == movie_id)
            .filter(dbi.dm.MovieImageFile.image_file_id == image_file_id)
            .first()
        )

def create_movie_metadata_file(movie_id: int, metadata_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.MovieMetadataFile()
        dbm.movie_id = movie_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_movie_metadata_file(movie_id: int, metadata_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.MovieMetadataFile)
            .filter(dbi.dm.MovieMetadataFile.movie_id == movie_id)
            .filter(dbi.dm.MovieMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_movie_tag(movie_id: int, tag_id: int):
    with dbi.session() as db:
        existing = (
            db.query(dbi.dm.MovieTag)
            .filter(
                dbi.dm.MovieTag.movie_id == movie_id,
                dbi.dm.MovieTag.tag_id == tag_id
            ).first()
        )
        if existing:
            return existing
        dbm = dbi.dm.MovieTag()
        dbm.movie_id = movie_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_movie_shelf_watched(ticket:dbi.dm.Ticket,shelf_id:int,is_watched:bool=True):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    movies = get_movie_list(ticket=ticket,shelf_id=shelf_id,load_files=False)
    movie_ids = [xx.id for xx in movies]
    with dbi.session() as db:
        db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.movie_id.in_(movie_ids)
        ).delete()
        db.commit()
        if is_watched:
            movies_watched = []
            for movie_id in movie_ids:
                movies_watched.append({
                    'client_device_user_id': ticket.cduid,
                    'movie_id': movie_id
                })
            db.bulk_insert_mappings(dbi.dm.Watched,movies_watched)
            db.commit()
            return True
        return False

def get_movie_shelf_watched(ticket:dbi.dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    movies = get_movie_list(ticket=ticket,shelf_id=shelf_id,load_files=False)
    return all(xx.watched for xx in movies)


def set_movie_watched(ticket:dbi.dm.Ticket, movie_id:int, is_watched:bool=True):
    with dbi.session() as db:
        movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
        if not movie:
            return False
        db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.movie_id == movie_id
        ).delete()
        db.query(dbi.dm.WatchProgress).filter(
            dbi.dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.WatchProgress.movie_id == movie_id
        ).delete()
        db.commit()
        if is_watched:
            dbm = dbi.dm.Watched()
            dbm.client_device_user_id = ticket.cduid
            dbm.movie_id = movie_id
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
            return True
    return is_watched

def get_movie_watched(ticket:dbi.dm.Ticket,movie_id:int):
    movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
    if not movie:
        return False
    with dbi.session() as db:
        watched = db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.movie_id == movie_id
        ).first()
        return False if watched == None else True

def set_movie_watch_progress(ticket:dbi.dm.Ticket, watch_progress:am.WatchProgress):
    movie = get_movie_by_id(ticket=ticket,movie_id=watch_progress.movie_id)
    if not movie:
        return False
    is_watched = False
    with dbi.session() as db:
        db.query(dbi.dm.WatchProgress).filter(
                dbi.dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchProgress.movie_id == watch_progress.movie_id
            ).delete()
        db.commit()
        watch_percent = float(watch_progress.played_seconds) / float(watch_progress.duration_seconds)
        if watch_percent <= dbi.config.watch_progress_unwatched_threshold:
            set_movie_watched(ticket=ticket,movie_id=watch_progress.movie_id,is_watched=False)
        elif watch_percent >= dbi.config.watch_progress_watched_threshold:
            set_movie_watched(ticket=ticket,movie_id=watch_progress.movie_id,is_watched=True)
            is_watched = True
        else:
            dbm = dbi.dm.WatchProgress()
            dbm.client_device_user_id = ticket.cduid
            dbm.movie_id = watch_progress.movie_id
            dbm.duration_seconds = watch_progress.duration_seconds
            dbm.played_seconds = watch_progress.played_seconds
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
    return is_watched

def make_movie_watch_count(cduid:int,movie_id):
    dbm = dbi.dm.WatchCount()
    dbm.amount = 1
    dbm.client_device_user_id = cduid
    dbm.movie_id = movie_id
    return dbm


def increase_movie_watch_count(ticket:dbi.dm.Ticket,movie_id:int):
    movie = get_movie_by_id(ticket=ticket,movie_id=movie_id)
    if not movie:
        return False
    with dbi.session() as db:
        existing_count = (
            db.query(dbi.dm.WatchCount)
            .filter(
                dbi.dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchCount.movie_id == movie_id
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


def reset_movie_watch_count(ticket:dbi.dm.Ticket,movie_id:int):
    with dbi.session() as db:
        (
            db.query(dbi.dm.WatchCount)
            .filter(
                dbi.dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchCount.movie_id == movie_id
            ).delete()
        )
        db.commit()
        return True

def get_unknown_movie_list(shelf_id:int=None):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Movie)
            .options(dbi.orm.joinedload(dbi.dm.Movie.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Movie.metadata_files))
            .options(dbi.orm.joinedload(dbi.dm.Movie.video_files))
        )
        if shelf_id:
            query = query.join(dbi.dm.MovieShelf).filter(dbi.dm.MovieShelf.shelf_id == shelf_id)
        query = query.filter(dbi.dm.Movie.remote_metadata_id == None)
        movies = query.all()
        results = []
        for movie in movies:
            if movie.video_files and (not movie.image_files or not movie.metadata_files):
                results.append(movie)
        return results

def delete_movies_without_videos():
    with dbi.session() as db:
        raw_query = '''
            select
                movie.id as movie_id,
                movie.directory as movie_directory,
                movie_video_file.id as movie_video_file_id,
                video_file.id as video_file_id
            from
            movie
                left join movie_video_file on movie_video_file.movie_id = movie.id
                left join video_file on movie_video_file.video_file_id = video_file.id
            where
                movie_video_file.video_file_id is null
                or video_file.id is null;
        '''
        cursor = db.execute(dbi.sql_text(raw_query))
        video_found = {}
        no_videos = {}
        for row in cursor:
            if row.video_file_id:
                video_found[row.movie_id] = True
            else:
                no_videos[row.movie_id] = row.movie_directory
        delete_ids = []
        results = []
        for xx in no_videos.keys():
            if xx in video_found:
                continue
            delete_ids.append(xx)
            results.append(f'id [{xx}] directory [{no_videos[xx]}]')
        if delete_ids:
            delete_target = ','.join([f'{xx}' for xx in delete_ids])
            db.execute(dbi.sql_text(f'delete from movie where movie.id in ({delete_target});'))
            db.commit()
        return results

def delete_movie_records(ticket:dbi.dm.Ticket, movie_id:int):
    if not movie_id:
        return False
    with dbi.session() as db:
        db.execute(dbi.sql_text(f'delete from movie where movie.id = {movie_id};'))
        db.commit()
        return True