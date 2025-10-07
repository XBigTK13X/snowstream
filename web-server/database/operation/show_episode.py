from database.operation.db_internal import dbi
import api_models as am
SeasonTags = dbi.orm.aliased(dbi.dm.Tag)

def create_show_episode(
    show_season_id: int,
    episode_order_counter: int,
    episode_end_order_counter: int = None,
    name:str=None):
    with dbi.session() as db:
        dbm = dbi.dm.ShowEpisode()
        dbm.episode_order_counter = episode_order_counter
        dbm.episode_end_order_counter = episode_end_order_counter
        dbm.show_season_id = show_season_id
        dbm.name = name
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_show_episode_name(show_episode_id:int,name:str):
    with dbi.session() as db:
        episode = db.query(dbi.dm.ShowEpisode).filter(dbi.dm.ShowEpisode.id == show_episode_id).first()
        episode.name = name
        db.commit()
        return episode

def sql_row_to_api_result(
        row,
        watch_group = None,
        load_episode_files=True,
        trim_episode_files=False
):
    episode = dbi.dm.Stub()
    episode.model_kind = 'show_episode'
    episode.id = row.episode_id
    episode.episode_order_counter = row.episode_order
    episode.episode_end_order_counter = row.episode_end_order
    episode.name = row.episode_name
    episode.watch_count = dbi.dm.Stub()
    episode.watch_count.amount = 0
    if watch_group:
        episode.watched = bool(row.episode_watched_list)
        episode.watch_count.amount = row.episode_watch_count_list[0] if row.episode_watch_count_list else 0
        episode.in_progress = dbi.dm.Stub()
        episode.in_progress.played_seconds = row.episode_in_progress_list[0] if row.episode_in_progress_list else None

    episode.season = dbi.dm.Stub()
    episode.season.model_kind = 'show_season'
    episode.season.id = row.season_id
    episode.season.season_order_counter = row.season_order

    episode.season.show = dbi.dm.Stub()
    episode.season.show.model_kind = 'show'
    episode.season.show.id = row.show_id
    episode.season.show.name = row.show_name

    episode.season.show.shelf = dbi.dm.Stub()
    episode.season.show.shelf.model_kind = 'shelf'
    episode.season.show.shelf.id = row.shelf_id
    episode.season.show.shelf.name = row.shelf_name

    episode.image_files = []
    episode.video_files = []
    episode.metadata_files = []
    screencap_is_meta = False
    poster_is_meta = False
    episode.poster_image = None
    episode.screencap_image = None
    episode.has_images = False
    episode.has_videos = False
    image_ids = row.show_image_id_list
    image_local_paths = row.show_image_local_path_list
    image_web_paths = row.show_image_web_path_list
    image_kinds = row.show_image_kind_list
    image_thumbnail_web_paths = row.show_image_thumbnail_web_path_list
    if load_episode_files:
        image_ids += row.image_id_list
        image_local_paths += row.image_local_path_list
        image_web_paths += row.image_web_path_list
        image_kinds += row.image_kind_list
        image_thumbnail_web_paths += row.image_thumbnail_web_path_list

    dedupe = {}

    for ii in range(0,len(image_ids)):
        if image_ids[ii] == None:
                continue
        episode.has_images = True
        if f'i-{image_ids[ii]}' in dedupe:
            continue
        dedupe[f'i-{image_ids[ii]}'] = 1
        image_file = dbi.dm.Stub()
        image_file.model_kind = 'image_file'
        image_file.id = image_ids[ii]
        image_file.local_path = image_local_paths[ii]
        image_file.web_path = image_web_paths[ii]
        image_file.kind = image_kinds[ii]
        image_file.thumbnail_web_path = image_thumbnail_web_paths[ii]
        if not episode.screencap_image or screencap_is_meta:
            if not episode.poster_image or poster_is_meta:
                if 'poster' in image_file.kind:
                    episode.poster_image = image_file
                    poster_is_meta = '/metadata/' in image_file.local_path
            if 'screencap' in image_file.kind:
                episode.screencap_image = image_file
                screencap_is_meta = '/metadata/' in image_file.local_path
        episode.image_files.append(image_file)

    if load_episode_files:
        for ii in range(0,len(row.video_id_list)):
            if row.video_id_list[ii] == None:
                continue
            if f'v-{row.video_id_list[ii]}' in dedupe:
                continue
            episode.has_videos = True
            dedupe[f'v-{row.video_id_list[ii]}'] = 1
            video_file = dbi.dm.Stub()
            video_file.model_kind = 'video_file'
            video_file.id = row.video_id_list[ii]
            video_file.local_path = row.video_local_path_list[ii]
            video_file.network_path = row.video_network_path_list[ii]
            video_file.kind = row.video_kind_list[ii]
            video_file.snowstream_info_json = row.video_info_list[ii]
            video_file.ffprobe_raw_json = row.video_ffprobe_list[ii]
            video_file.mediainfo_raw_json = row.video_mediainfo_list[ii]
            video_file.version = row.video_version_list[ii]
            episode.video_files.append(video_file)

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
            metadata_file.local_path = row.metadata_local_path_list[ii]
            metadata_file.xml_content = row.metadata_xml_content_list[ii]
            episode.metadata_files.append(metadata_file)

    episode.tags = []
    episode.tag_ids = []
    episode.tag_names = []
    tag_ids = row.episode_tag_id_list + row.season_tag_id_list + row.show_tag_id_list
    tag_names = row.episode_tag_name_list + row.season_tag_name_list + row.show_tag_name_list
    tag_dedupe = {}
    for ii in range(0,len(tag_ids)):
        if f't-{tag_ids[ii]}' in dedupe:
            continue
        dedupe[f't-{tag_ids[ii]}'] = 1
        tag = dbi.dm.Stub()
        tag.id = tag_ids[ii]
        episode.tag_ids.append(tag.id)
        tag.name = tag_names[ii]
        episode.tag_names.append(tag.name)
        episode.tags.append(tag)
        tag_dedupe[tag_ids[ii]] = True

    if trim_episode_files:
        del episode.metadata_files
        del episode.video_files
        del episode.image_files

    return episode

def get_show_episode_list(
    ticket:dbi.dm.Ticket,
    shelf_id:int=None,
    show_id:int=None,
    show_season_id:int=None,
    show_episode_id:int=None,
    include_specials:int=None,
    search_query:str=None,
    only_watched:bool=None,
    only_unwatched:bool=None,
    first_per_show:bool=None,
    first_per_season:bool=None,
    first_result:bool=None,
    load_episode_files:bool=True,
    trim_episode_files:bool=False,
    show_playlisted:bool=True,
    bump_specials:bool=False
):
    if first_per_show and first_per_season:
        dbi.log.error("Only first_per_show OR first_per_season can be used to retrieve an episode list")
        return []
    if shelf_id != None and not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with dbi.session() as db:
        watch_group = None
        if ticket.watch_group:
            watch_group = ','.join([str(xx) for xx in ticket.watch_group])
        if search_query:
            search_query = search_query.replace("'","''")
        season_order_query = 'season.season_order_counter'
        if bump_specials:
            season_order_query = '''
        case
            when season.season_order_counter = 0 then 100000
            else season.season_order_counter
        end
        '''
        raw_query =f'''
        select

        {f'distinct on (show.name)' if first_per_show else ''}
        {f'distinct on (season.season_order_counter)' if first_per_season else ''}

        episode.id as episode_id,
        episode.name as episode_name,
        episode.episode_order_counter as episode_order,
        episode.episode_end_order_counter as episode_end_order,
        {"array_remove(array_agg(watched.id),NULL) as episode_watched_list," if watch_group else ""}
        {"array_remove(array_agg(watch_count.amount),NULL) as episode_watch_count_list," if watch_group else ""}
        {"array_remove(array_agg(watch_progress.played_seconds),NULL) as episode_in_progress_list," if watch_group else ""}

        season.id as season_id,
        season.season_order_counter as season_order,

        show.id as show_id,
        show.name as show_name,

        shelf.id as shelf_id,
        shelf.name as shelf_name,

        {"""
        array_remove(array_agg(episode_image.id),NULL) as image_id_list,
        array_remove(array_agg(episode_image.local_path),NULL) as image_local_path_list,
        array_remove(array_agg(episode_image.web_path),NULL) as image_web_path_list,
        array_remove(array_agg(episode_image.kind),NULL) as image_kind_list,
        array_remove(array_agg(episode_image.thumbnail_web_path),NULL) as image_thumbnail_web_path_list,

        array_agg(episode_video.id) as video_id_list,
        array_agg(episode_video.kind) as video_kind_list,
        array_agg(episode_video.local_path) as video_local_path_list,
        array_agg(episode_video.network_path) as video_network_path_list,
        array_agg(episode_video.snowstream_info_json) as video_info_list,
        array_agg(episode_video.ffprobe_raw_json) as video_ffprobe_list,
        array_agg(episode_video.mediainfo_raw_json) as video_mediainfo_list,
        array_agg(episode_video.version) as video_version_list,

        array_agg(episode_metadata.id) as metadata_id_list,
        array_agg(episode_metadata.kind) as metadata_kind_list,
        array_agg(episode_metadata.local_path) as metadata_local_path_list,
        array_agg(episode_metadata.xml_content) as metadata_xml_content_list,
        """ if load_episode_files else ''}

        array_remove(array_agg(show_image.id),NULL) as show_image_id_list,
        array_remove(array_agg(show_image.local_path),NULL) as show_image_local_path_list,
        array_remove(array_agg(show_image.web_path),NULL) as show_image_web_path_list,
        array_remove(array_agg(show_image.kind),NULL) as show_image_kind_list,
        array_remove(array_agg(show_image.thumbnail_web_path),NULL) as show_image_thumbnail_web_path_list,

        array_remove(array_agg(show_tag.name),NULL) as show_tag_name_list,
        array_remove(array_agg(show_tag.id),NULL) as show_tag_id_list,
        array_remove(array_agg(season_tag.name),NULL) as season_tag_name_list,
        array_remove(array_agg(season_tag.id),NULL) as season_tag_id_list,
        array_remove(array_agg(episode_tag.name),NULL) as episode_tag_name_list,
        array_remove(array_agg(episode_tag.id),NULL) as episode_tag_id_list

        from show_episode as episode
        join show_season as season on season.id = episode.show_season_id
            {f' and episode.id = {show_episode_id}' if show_episode_id else ''}
            {f" and episode.name ilike '%{search_query}%'" if search_query else ''}
            {f' and season.season_order_counter != 0' if not include_specials else ''}
            {f' and season.id = {show_season_id}' if show_season_id else ''}
        join show as show on show.id = season.show_id
            {f' and show.id = {show_id}' if show_id else ''}
        join show_shelf as show_shelf on show_shelf.show_id = show.id
        join shelf as shelf on show_shelf.shelf_id = shelf.id
            {f' and shelf.id = {shelf_id}' if shelf_id else ''}
        {f"""
        left join watched as watched on (
            watched.client_device_user_id in ({watch_group})
            and watched.show_episode_id = episode.id
        )
        """ if watch_group else ""}
        {f"""
        left join watch_progress as watch_progress on (
            watch_progress.client_device_user_id in ({watch_group})
            and watch_progress.show_episode_id = episode.id
        )
        """ if watch_group else ""}
        {"""
        left join show_episode_image_file as seif on seif.show_episode_id = episode.id
        left join image_file as episode_image on seif.image_file_id = episode_image.id
        left join show_episode_video_file as sevf on sevf.show_episode_id = episode.id
        left join video_file as episode_video on sevf.video_file_id = episode_video.id
        left join show_episode_metadata_file as semf on semf.show_episode_id = episode.id
        left join metadata_file as episode_metadata on semf.metadata_file_id = episode_metadata.id
        """ if load_episode_files else ""}

        left join show_image_file as sif on sif.show_id = show.id
        left join image_file as show_image on sif.image_file_id = show_image.id

        left join show_tag as st on st.show_id = show.id
        left join tag as show_tag on show_tag.id = st.tag_id
        left join show_season_tag as sst on sst.show_season_id = season.id
        left join tag as season_tag on season_tag.id = sst.tag_id
        left join show_episode_tag as setag on setag.show_episode_id = episode.id
        left join tag as episode_tag on episode_tag.id = setag.tag_id
        {f"""
        left join watch_count as watch_count on
            watch_count.client_device_user_id in ({watch_group})
            and watch_count.show_episode_id = episode.id
        """ if watch_group else ""}

        where 1=1
        {f" and watched.id is null" if only_unwatched and watch_group else ''}
        {f" and watched.id is not null" if only_watched and watch_group else ''}
        group by
            shelf.id,
            shelf.name,
            show.id,
            show.name,
            season.id,
            season.season_order_counter,
            episode.episode_order_counter,
            episode.episode_end_order_counter,
            episode.id,
            episode.name
        order by
            {f"show.name," if not first_per_season else ""}
            {season_order_query},
            episode.episode_order_counter
        {f'limit {dbi.config.search_results_per_shelf_limit}' if search_query else ''}
        {f'limit 1' if first_result else ''}
        '''
        cursor = db.execute(dbi.sql_text(raw_query))
        results = []
        raw_result_count = 0
        for xx in cursor:
            raw_result_count += 1
            model = sql_row_to_api_result(
                row=xx,
                load_episode_files=load_episode_files,
                trim_episode_files=trim_episode_files,
                watch_group=watch_group
            )
            if load_episode_files and not model.has_images and not show_season_id:
                continue
            if load_episode_files and not model.has_videos:
                continue
            if not ticket.is_allowed(tag_ids=model.tag_ids):
                continue
            if show_playlisted == False and any('Playlist:' in xx for xx in model.tag_names):
                continue
            if not model.name or 'TBA' in model.name:
                model.name = dbi.util.get_episode_slug(model)
            results.append(model)
        if first_result == True:
            return results[0]
        return results

def get_show_episode_by_id(ticket:dbi.dm.Ticket,episode_id: int):
    with dbi.session() as db:
        return get_show_episode_list(
            ticket=ticket,
            show_episode_id=episode_id,
            first_result=True,
            load_episode_files=True,
            include_specials=True
        )

def get_show_episode_by_season_order(show_season_id: int, episode_order_counter: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowEpisode)
            .options(dbi.orm.joinedload(dbi.dm.ShowEpisode.tags))
            .filter(dbi.dm.ShowEpisode.show_season_id == show_season_id)
            .filter(dbi.dm.ShowEpisode.episode_order_counter == episode_order_counter)
            .first()
        )

def create_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowEpisodeVideoFile()
        dbm.show_episode_id = show_episode_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowEpisodeVideoFile)
            .filter(dbi.dm.ShowEpisodeVideoFile.show_episode_id == show_episode_id)
            .filter(dbi.dm.ShowEpisodeVideoFile.video_file_id == video_file_id)
            .first()
        )

def create_show_episode_image_file(show_episode_id: int, image_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowEpisodeImageFile()
        dbm.show_episode_id = show_episode_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_image_file(show_episode_id: int, image_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowEpisodeImageFile)
            .filter(dbi.dm.ShowEpisodeImageFile.show_episode_id == show_episode_id)
            .filter(dbi.dm.ShowEpisodeImageFile.image_file_id == image_file_id)
            .first()
        )

def create_show_episode_metadata_file(show_episode_id: int, metadata_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowEpisodeMetadataFile()
        dbm.show_episode_id = show_episode_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_metadata_file(show_episode_id: int, metadata_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowEpisodeMetadataFile)
            .filter(dbi.dm.ShowEpisodeMetadataFile.show_episode_id == show_episode_id)
            .filter(dbi.dm.ShowEpisodeMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_episode_tag(show_episode_id: int, tag_id: int):
    with dbi.session() as db:
        existing = db.query(dbi.dm.ShowEpisodeTag).filter(
            dbi.dm.ShowEpisodeTag.show_episode_id == show_episode_id,
            dbi.dm.ShowEpisodeTag.tag_id == tag_id
        ).first()
        if existing:
            return existing
        dbm = dbi.dm.ShowEpisodeTag()
        dbm.show_episode_id = show_episode_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_show_episode_watched(ticket:dbi.dm.Ticket,episode_id:int,is_watched:bool=True):
    episode = get_show_episode_by_id(ticket=ticket,episode_id=episode_id)
    if not episode:
        return False
    with dbi.session() as db:
        db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.show_episode_id == episode_id
        ).delete()
        db.query(dbi.dm.WatchProgress).filter(
            dbi.dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.WatchProgress.show_episode_id == episode_id
        ).delete()
        db.commit()
        if is_watched:
            dbm = dbi.dm.Watched()
            dbm.client_device_user_id = ticket.cduid
            dbm.show_episode_id = episode_id
            db.add(dbm)
            db.commit()
            return True
    return is_watched

def set_show_episode_list_watched(ticket:dbi.dm.Ticket, episode_ids:list[int]):
    with dbi.session() as db:
        episodes_watched = []
        for episode_id in episode_ids:
            episodes_watched.append({
                'client_device_user_id': ticket.cduid,
                'show_episode_id': episode_id
            })
        db.bulk_insert_mappings(dbi.dm.Watched,episodes_watched)
        db.commit()
        return True
    return False

def set_show_episode_watch_progress(ticket:dbi.dm.Ticket, watch_progress:am.WatchProgress):
    if not watch_progress.played_seconds:
        return False
    if not watch_progress.duration_seconds:
        return False
    episode = get_show_episode_by_id(ticket=ticket,episode_id=watch_progress.show_episode_id)
    if not episode:
        return False
    is_watched = False
    with dbi.session() as db:
        db.query(dbi.dm.WatchProgress).filter(
                dbi.dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchProgress.show_episode_id == watch_progress.show_episode_id
            ).delete()
        db.commit()
        watch_percent = float(watch_progress.played_seconds) / float(watch_progress.duration_seconds)
        if watch_percent <= dbi.config.watch_progress_unwatched_threshold:
            if episode.watched:
                set_show_episode_watched(ticket=ticket,episode_id=watch_progress.show_episode_id,is_watched=False)
        elif watch_percent >= dbi.config.watch_progress_watched_threshold:
            if not episode.watched:
                is_watched = True
                set_show_episode_watched(ticket=ticket,episode_id=watch_progress.show_episode_id,is_watched=True)
        else:
            dbm = dbi.dm.WatchProgress()
            dbm.client_device_user_id = ticket.cduid
            dbm.show_episode_id = watch_progress.show_episode_id
            dbm.duration_seconds = watch_progress.duration_seconds
            dbm.played_seconds = watch_progress.played_seconds
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
    return is_watched

def make_show_episode_watch_count(cduid:int,show_episode_id:int):
    dbm = dbi.dm.WatchCount()
    dbm.client_device_user_id = cduid
    dbm.show_episode_id = show_episode_id
    dbm.amount = 1
    return dbm

def increase_show_episode_watch_count(ticket:dbi.dm.Ticket,show_episode_id:int):
    episode = get_show_episode_by_id(ticket=ticket,episode_id=show_episode_id)
    if not episode:
        return False
    with dbi.session() as db:
        existing_count = (
            db.query(dbi.dm.WatchCount)
            .filter(
                dbi.dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchCount.show_episode_id == show_episode_id
            ).first()
        )
        if existing_count:
            existing_count.amount += 1
            db.commit()
            return existing_count
        else:
            new_count = make_show_episode_watch_count(cduid=ticket.cduid,show_episode_id=show_episode_id)
            db.add(new_count)
            db.commit()
            return new_count

def reset_show_episode_watch_count(ticket:dbi.dm.Ticket,show_episode_id:int):
    with dbi.session() as db:
        (
            db.query(dbi.dm.WatchCount)
            .filter(
                dbi.dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchCount.show_episode_id == show_episode_id
            ).delete()
        )
        db.commit()
        return True

def delete_show_episodes_without_videos():
    with dbi.session() as db:
        raw_query = '''
            select
                show_episode.id as episode_id,
                show_season.directory as season_directory,
                show_episode_video_file.id as episode_video_file_id,
                video_file.id as video_file_id
            from
            show_episode
                join show_season on show_season.id = show_episode.show_season_id
                left join show_episode_video_file on show_episode_video_file.show_episode_id = show_episode.id
                left join video_file on show_episode_video_file.video_file_id = video_file.id
            where
                show_episode_video_file.video_file_id is null
                or video_file.id is null;
        '''
        cursor = db.execute(dbi.sql_text(raw_query))
        video_found = {}
        no_videos = {}
        for row in cursor:
            if row.video_file_id:
                video_found[row.episode_id] = True
            else:
                no_videos[row.episode_id] = row.season_directory
        delete_ids = []
        results = []
        for xx in no_videos.keys():
            if xx in video_found:
                continue
            delete_ids.append(xx)
            results.append(f'id [{xx}] directory [{no_videos[xx]}]')
        if delete_ids:
            delete_target = ','.join([f'{xx}' for xx in delete_ids])
            db.execute(dbi.sql_text(f'delete from show_episode where show_episode.id in ({delete_target});'))
            db.commit()
        return results

def delete_show_episode_records(ticket:dbi.dm.Ticket, show_episode_id:int):
    if not show_episode_id:
        return False
    with dbi.session() as db:
        db.execute(dbi.sql_text(f'delete from show_episode where show_episode.id = {show_episode_id};'))
        db.commit()
        return True