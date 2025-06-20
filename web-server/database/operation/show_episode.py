import util
import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy import text as sql_text
from settings import config
import database.operation.show as db_show
import database.operation.show_season as db_season

SeasonTags = sorm.aliased(dm.Tag)

def create_show_episode(
    show_season_id: int,
    episode_order_counter: int,
    episode_end_order_counter: int = None,
    name:str=None):
    with DbSession() as db:
        dbm = dm.ShowEpisode()
        dbm.episode_order_counter = episode_order_counter
        dbm.episode_end_order_counter = episode_end_order_counter
        dbm.show_season_id = show_season_id
        dbm.name = name
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_show_episode_name(show_episode_id:int,name:str):
    with DbSession() as db:
        episode = db.query(dm.ShowEpisode).filter(dm.ShowEpisode.id == show_episode_id).first()
        episode.name = name
        db.commit()
        return episode

def sql_row_to_api_result(row,load_episode_files):
    episode = dm.Stub()
    episode.model_kind = 'show_episode'
    episode.watched = row.episode_watched != None
    episode.id = row.episode_id
    episode.episode_order_counter = row.episode_order

    if load_episode_files:
        image_file = dm.Stub()
        image_file.id = row.image_id
        image_file.local_path = row.image_local_path
        image_file.web_path = row.image_web_path
        image_file.kind = row.image_kind
        image_file.thumbnail_web_path = row.image_thumbnail_web_path
        episode.image_files = [image_file]

        video_file = dm.Stub()
        video_file.id = row.video_id
        video_file.web_path = row.video_network_path
        video_file.ffprobe_pruned_json = row.video_ffprobe
        video_file.version = row.video_version
        episode.video_files = [video_file]

        metadata_file = dm.Stub()
        metadata_file.id = row.metadata_id
        metadata_file.local_path = row.metadata_local_path
        episode.metadata_files = [metadata_file]
    else:
        episode.image_files = None
        episode.metadata_files = None
        episode.video_files = None

    episode.season = dm.Stub()
    episode.season.model_kind = 'show_season'
    episode.season.id = row.season_id
    episode.season.season_order_counter = row.season_order

    episode.season.show = dm.Stub()
    episode.season.show.model_kind = 'show'
    episode.season.show.id = row.show_id
    episode.season.show.name = row.show_name
    show_image_file = dm.Stub()
    show_image_file.id = row.show_image_id
    show_image_file.local_path = row.show_image_local_path
    show_image_file.web_path = row.show_image_web_path
    show_image_file.kind = row.show_image_kind
    show_image_file.thumbnail_web_path = row.show_image_thumbnail_web_path
    episode.season.show.image_files = [show_image_file]

    episode.season.show.shelf = dm.Stub()
    episode.season.show.shelf.model_kind = 'shelf'
    episode.season.show.shelf.id = row.shelf_id

    return episode

def set_primary_images(stub:dm.Stub):
    stub = dm.set_primary_images(stub)
    stub.season.show = dm.set_primary_images(stub.season.show)
    if not stub.screencap_image:
        stub.screencap_image = stub.season.show.screencap_image
    if not stub.poster_image:
        stub.poster_image = stub.season.show.poster_image
    return stub

def get_episodes_skip_orm(
    ticket:dm.Ticket,
    shelf_id:int=None,
    show_id:int=None,
    show_season_id:int=None,
    show_episode_id:int=None,
    include_specials:int=None,
    search_query:str=None,
    only_watched:bool=None,
    only_unwatched:bool=None,
    first_per_show:bool=None,
    first_result:bool=None,
    load_episode_files:bool=True
):
    log.info("DEBUG -- Generating the episode list query")
    with DbSession() as db:
        # TODO If requesting unwatched, filter on that and limit results per group to 1
        # TODO Filter content by tags
        watch_group = ','.join([str(xx) for xx in ticket.watch_group])
        if search_query:
            search_query = search_query.replace("'","''")
        log.info("DEBUG -- Ready to fill in the query template")
        raw_query =f'''
        select
            episode.id as episode_id,
            episode.name as episode_name,
            watched.id as episode_watched,
            episode.episode_order_counter as episode_order,

            episode.show_season_id as season_id,
            season.season_order_counter as season_order,

            show.id as show_id,
            show.name as show_name,

            shelf.id as shelf_id,
            shelf.name as shelf_name,

            {"""
            episode_image.id as image_id,
            episode_image.local_path as image_local_path,
            episode_image.web_path as image_web_path,
            episode_image.kind as image_kind,
            episode_image.thumbnail_web_path as image_thumbnail_web_path,

            episode_video.id as video_id,
            episode_video.network_path as video_network_path,
            episode_video.ffprobe_pruned_json as video_ffprobe,
            episode_video.version as video_version,

            episode_metadata.id as metadata_id,
            episode_metadata.local_path as metadata_local_path,
            """ if load_episode_files else ''}

            show_image.id as show_image_id,
            show_image.local_path as show_image_local_path,
            show_image.web_path as show_image_web_path,
            show_image.kind as show_image_kind,
            show_image.thumbnail_web_path as show_image_thumbnail_web_path

        from show_episode as episode
        join show_season as season on season.id = episode.show_season_id
            {f' and episode.id = {show_episode_id}' if show_episode_id else ''}
            {f" and episode.name ilike '%{search_query}%'" if search_query else ''}
            {f' and season.season_order_counter != 0' if not include_specials else ''}
        join show as show on show.id = season.show_id
            {f' and season.id = {show_season_id}' if show_season_id else ''}
        join show_shelf as show_shelf on show_shelf.show_id = show.id
            {f' and show.id = {show_id}' if show_id else ''}
        join shelf as shelf on show_shelf.shelf_id = shelf.id
            {f' and shelf.id = {shelf_id}' if shelf_id else ''}
        left join watched as watched on (
            watched.client_device_user_id in ({watch_group})
            and watched.shelf_id = shelf.id
            and watched.show_id = show.id
            and (watched.show_season_id is null or watched.show_season_id = season.id)
            and (watched.show_episode_id is null or watched.show_episode_id = episode.id)
        )

        {'''
        left join show_episode_image_file as seif on seif.show_episode_id = episode.id
        join image_file as episode_image on seif.image_file_id = episode_image.id
        left join show_episode_video_file as sevf on sevf.show_episode_id = episode.id
        join video_file as episode_video on sevf.video_file_id = episode_video.id
        left join show_episode_metadata_file as semf on semf.show_episode_id = episode.id
        join metadata_file as episode_metadata on semf.metadata_file_id = episode_metadata.id
        ''' if load_episode_files else ''}

        left join show_image_file as sif on sif.show_id = show.id
        join image_file as show_image on sif.image_file_id = show_image.id
        where 1=1
        {f" and watched.id is null" if only_unwatched else ''}
        {f" and watched.id is not null" if only_watched else ''}
        order by
            show.name,
            season.season_order_counter,
            episode.episode_order_counter
            {f'limit {config.search_results_per_shelf_limit}' if search_query else ''}
        '''
        log.info("DEBUG -- Executing the built query")
        cursor = db.execute(sql_text(raw_query))
        log.info("DEBUG -- Cursor generated")
        dedupe_ep = {}
        dedupe_images = {}
        dedupe_metadata = {}
        dedupe_video = {}
        results = []
        log.info("DEBUG -- Deduplicating results")
        raw_result_count = 0
        for xx in cursor:
            raw_result_count += 1
            model = sql_row_to_api_result(row=xx,load_episode_files=load_episode_files)
            is_dupe_episode = False
            if not model.id in dedupe_ep:
                if len(results) > 0:
                    results[-1] = set_primary_images(results[-1])
                    if first_result == True:
                        return results[0]
                dedupe_ep[model.id] = True
                results.append(model)
            else:
                is_dupe_episode = True
            if not model.season.show.image_files[0].id in dedupe_images:
                dedupe_images[model.season.show.image_files[0].id] = True
                if is_dupe_episode:
                    results[-1].season.show.image_files.append(model.season.show.image_files[0])
            if load_episode_files:
                if model.image_files and not model.image_files[0].id in dedupe_images:
                    dedupe_images[model.image_files[0].id] = True
                    if is_dupe_episode:
                        results[-1].image_files.append(model.image_files[0])
                if model.video_files and not model.video_files[0].id in dedupe_video:
                    dedupe_video[model.video_files[0].id] = True
                    if is_dupe_episode:
                        results[-1].video_files.append(model.video_files[0])
                if model.metadata_files and not model.metadata_files[0].id in dedupe_metadata:
                    dedupe_metadata[model.metadata_files[0].id] = True
                    if is_dupe_episode:
                        results[-1].metadata_files.append(model.metadata_files[0])
        log.info(f"DEBUG -- Handling return conditions for {raw_result_count} raw items")
        if len(results) > 0:
            results[-1] = set_primary_images(results[-1])
        if first_per_show:
            hits = {}
            episodes = []
            for result in results:
                if not result.season.show.id in hits:
                    hits[result.season.show.id] = True
                    episodes.append(result)
            return episodes
        if first_result == True:
            return results[0]
        return results

def get_show_episode_by_id(ticket:dm.Ticket,episode_id: int):
    with DbSession() as db:
        return get_episodes_skip_orm(
            ticket=ticket,
            show_episode_id=episode_id,
            first_result=True
        )

def get_show_episode_by_season_order(show_season_id: int, episode_order_counter: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .options(sorm.joinedload(dm.ShowEpisode.tags))
            .filter(dm.ShowEpisode.show_season_id == show_season_id)
            .filter(dm.ShowEpisode.episode_order_counter == episode_order_counter)
            .first()
        )

def get_show_episode_list(
    ticket:dm.Ticket,
    shelf_id:int=None,
    show_id:int=None,
    show_season_id:int=None,
    search_query:str=None,
    only_watched:bool=None,
    only_unwatched:bool=None,
    load_episode_files:bool=True,
    include_specials:bool=True,
    first_per_show:bool=False
):
    if shelf_id != None and not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        return get_episodes_skip_orm(
            ticket=ticket,
            shelf_id=shelf_id,
            show_id=show_id,
            show_season_id=show_season_id,
            only_watched=only_watched,
            only_unwatched=only_unwatched,
            search_query=search_query,
            load_episode_files=load_episode_files,
            include_specials=include_specials,
            first_per_show=first_per_show
        )
        # if search_query:
        #     episodes_query = episodes_query.filter(dm.ShowEpisode.name.ilike(f'%{search_query}%')).limit(config.search_results_per_shelf_limit)
        # if shelf_id:
        #     episodes_query = episodes_query.filter(dm.ShowEpisode.season.show.shelf.id == shelf_id)
        # if show_id:
        #     episodes_query = episodes_query.filter(dm.ShowEpisode.season.show.id == show_id)
        # if not include_specials:
        #     episodes_query = episodes_query.filter(dm.ShowEpisode.season.season_order_counter != 0)
        episodes = eager_load_episodes(
            shelf_id=shelf_id,
            show_id=show_id,
            show_season_id=show_season_id,
            include_specials=include_specials
        )

        watched_query = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id
        )
        if show_id != None:
            watched_query = watched_query.filter(dm.Watched.show_id == show_id)
        if show_season_id != None:
            watched_query = watched_query.filter(dm.Watched.show_season_id == show_season_id)
        watched = watched_query.all()
        shelf_watched = False
        show_watched = {}
        season_watched = {}
        episode_watched = {}
        for watch in watched:
            if watch.shelf_id != None and watch.show_id == None and watch.show_season_id == None and watch.show_episode_id == None:
                shelf_watched = True
            elif watch.show_id != None and watch.show_season_id == None:
                show_watched[watch.show_id] = True
            elif watch.show_season_id != None and watch.show_episode_id == None:
                season_watched[watch.show_season_id] = True
            else:
                episode_watched[watch.show_episode_id] = True

        results = []
        for episode in episodes:
            if not ticket.is_allowed(tag_provider=episode.get_tag_ids):
                continue
            episode = dm.set_primary_images(episode)
            episode.episode_slug = util.get_episode_slug(episode)
            if shelf_watched or episode.season.show.id in show_watched or episode.season.id in season_watched or episode.id in episode_watched:
                episode.watched = True
            else:
                episode.watched = False
            results.append(episode)
        return results


def create_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeVideoFile()
        dbm.show_episode_id = show_episode_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisodeVideoFile)
            .filter(dm.ShowEpisodeVideoFile.show_episode_id == show_episode_id)
            .filter(dm.ShowEpisodeVideoFile.video_file_id == video_file_id)
            .first()
        )

def create_show_episode_image_file(show_episode_id: int, image_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeImageFile()
        dbm.show_episode_id = show_episode_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_image_file(show_episode_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisodeImageFile)
            .filter(dm.ShowEpisodeImageFile.show_episode_id == show_episode_id)
            .filter(dm.ShowEpisodeImageFile.image_file_id == image_file_id)
            .first()
        )

def create_show_episode_metadata_file(show_episode_id: int, metadata_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeMetadataFile()
        dbm.show_episode_id = show_episode_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_metadata_file(show_episode_id: int, metadata_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisodeMetadataFile)
            .filter(dm.ShowEpisodeMetadataFile.show_episode_id == show_episode_id)
            .filter(dm.ShowEpisodeMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_episode_tag(show_episode_id: int, tag_id: int):
    with DbSession() as db:
        existing = db.query(dm.ShowEpisodeTag).filter(
            dm.ShowEpisodeTag.show_episode_id == show_episode_id and dm.ShowEpisodeTag.tag_id == tag_id
        ).first()
        if existing:
            return existing
        dbm = dm.ShowEpisodeTag()
        dbm.show_episode_id = show_episode_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_show_episode_watched(ticket:dm.Ticket,episode_id:int,is_watched:bool=True):
    with DbSession() as db:
        episode = get_show_episode_by_id(ticket=ticket,episode_id=episode_id)
        if not episode:
            return False
        season = db_season.get_show_season_by_id(ticket=ticket,season_id=episode.season.id)
        if not season:
            return False
        show = db_show.get_show_by_id(ticket=ticket,show_id=season.show.id)
        if not show:
            return False
        shelf_id = show.shelf.id
        shelf_watched = db_show.get_show_shelf_watched(ticket=ticket,shelf_id=shelf_id)
        show_watched = db_show.get_show_watched(ticket=ticket,show_id=show.id)
        season_watched = db_season.get_show_season_watched(ticket=ticket,season_id=season.id)
        season_episodes = get_show_episode_list(
            ticket=ticket,
            shelf_id=shelf_id,
            show_season_id=season.id
        )
        if not season_episodes:
            return False
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == shelf_id,
            dm.Watched.show_id == show.id,
            dm.Watched.show_season_id == season.id,
            dm.Watched.show_episode_id == episode_id
        ).delete()
        db.commit()
        if is_watched and not season_watched:
            watched_episodes = [xx for xx in season_episodes if xx.watched]
            if len(watched_episodes) == len(season_episodes) - 1:
                db_season.set_show_season_watched(ticket=ticket,season_id=season.id,is_watched=True)
                return True
            else:
                dbm = dm.Watched()
                dbm.client_device_user_id = ticket.cduid
                dbm.shelf_id = shelf_id
                dbm.show_id = show.id
                dbm.show_season_id = season.id
                dbm.show_episode_id = episode_id
                db.add(dbm)
                db.commit()
                return True
        if not is_watched and season_watched:
            db_season.set_show_season_watched(ticket=ticket,season_id=season.id,is_watched=False)
            episodes_watched = []
            for other_episode in season_episodes:
                if other_episode.id == episode.id:
                    continue
                episodes_watched.append({
                    'show_episode_id': other_episode.id,
                    'show_season_id': season.id,
                    'show_id': show.id,
                    'shelf_id': shelf_id,
                    'client_device_user_id': ticket.cduid
                })
            db.bulk_insert_mappings(dm.Watched,episodes_watched)
            db.commit()
            return False

    return is_watched

def set_show_episode_watch_progress(ticket:dm.Ticket, watch_progress:am.WatchProgress):
    if not watch_progress.played_seconds:
        return False
    if not watch_progress.duration_seconds:
        return False
    episode = get_show_episode_by_id(ticket=ticket,episode_id=watch_progress.show_episode_id)
    if not episode:
        return False
    is_watched = False
    with DbSession() as db:
        db.query(dm.WatchProgress).filter(
                dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dm.WatchProgress.show_episode_id == watch_progress.show_episode_id
            ).delete()
        db.commit()
        watch_percent = float(watch_progress.played_seconds) / float(watch_progress.duration_seconds)
        if watch_percent <= config.watch_progress_unwatched_threshold:
            set_show_episode_watched(ticket=ticket,episode_id=watch_progress.show_episode_id,is_watched=False)
        elif watch_percent >= config.watch_progress_watched_threshold:
            is_watched = True
            set_show_episode_watched(ticket=ticket,episode_id=watch_progress.show_episode_id,is_watched=True)
        else:
            dbm = dm.WatchProgress()
            dbm.client_device_user_id = ticket.cduid
            dbm.show_episode_id = watch_progress.show_episode_id
            dbm.duration_seconds = watch_progress.duration_seconds
            dbm.played_seconds = watch_progress.played_seconds
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
    return is_watched

def make_show_episode_watch_count(cduid:int,show_episode_id:int):
    dbm = dm.WatchCount()
    dbm.client_device_user_id = cduid
    dbm.show_episode_id = show_episode_id
    dbm.amount = 1
    return dbm

def increase_show_episode_watch_count(ticket:dm.Ticket,show_episode_id:int):
    episode = get_show_episode_by_id(ticket=ticket,episode_id=show_episode_id)
    if not episode:
        return False
    with DbSession() as db:
        existing_count = (
            db.query(dm.WatchCount)
            .filter(
                dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dm.WatchCount.show_episode_id == show_episode_id
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

def reset_show_episode_watch_count(ticket:dm.Ticket,show_episode_id:int):
    with DbSession as db:
        (
            db.query(dm.WatchCount)
            .filter(
                dm.WatchCount.client_device_user_id.in_(ticket.watch_group),
                dm.WatchCount.show_episode_id == show_episode_id
            ).delete()
        )
        db.commit()
        return True
