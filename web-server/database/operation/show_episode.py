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

def sql_row_to_api_result(row:dict):
    episode = dm.Stub()
    episode.model_kind = 'show_episode'
    episode.watched = row['watched'] == '1'
    episode.id = row['episode_id']
    episode.episode_order_counter = row['episode_order']
    episode.season = dm.Stub()
    episode.season.model_kind = 'show_season'
    episode.season.id = row['season_id']
    episode.season.season_order_counter = row['season_order']
    episode.season.show = dm.Stub()
    episode.season.show.model_kind = 'show'
    episode.season.show.id = row['show_id']
    episode.season.show.shelf = dm.Stub()
    episode.season.show.shelf.model_kind = 'shelf'
    episode.season.show.shelf.id = row['shelf_id']
    return episode

def get_episodes_skip_orm(
    ticket:dm.Ticket,
    shelf_id:int=None,
    show_id:int=None,
    show_season_id:int=None,
    show_episode_id:int=None,
    include_specials:int=None,
    search_query:str=None,
    first:bool=None
):
    with DbSession() as db:
        # If requesting unwatched, filter on that and limit results per group to 1
        watch_group = ','.join([str(xx) for xx in ticket.watch_group])
        raw_query =f'''
        select
            episode.id as episode_id,
            episode.show_season_id as season_id,
            episode.name as episode_name,
            season.season_order_counter as season_order,
            episode.episode_order_counter as episode_order,
            show.id as show_id,
            show.name as show_name,
            shelf.id as shelf_id,
            shelf.name as shelf_name,
            cast(case when watched.id is null then 0 else 1 end as bit) as watched
        from show_episode as episode
        join show_season as season on season.id = episode.show_season_id
        join show as show on show.id = season.show_id
        join show_shelf as show_shelf on show_shelf.show_id = show.id
        join shelf as shelf on show_shelf.shelf_id = shelf.id
        left join watched as watched on (
            watched.client_device_user_id in ({watch_group}) and watched.shelf_id = shelf.id and (
                watched.show_id = show.id or watched.show_season_id = season.id or watched.show_episode_id = episode.id
            )
        )
        where 1=1
        '''
        if shelf_id:
            raw_query += f'''
            and shelf.id = {shelf_id}
            '''
        if show_episode_id:
            raw_query += f'''
            and episode.id = {show_episode_id}
            '''
        if show_season_id:
            raw_query += f'''
            and season.id = {show_season_id}
            '''
        if show_id:
            raw_query += f'''
            and show.id = {show_id}
            '''
        if not include_specials:
            raw_query += f'''
            and season.season_order_counter != 0
            '''
        if search_query:
            raw_query += f'''
            and episode.name ilike '%{search_query}%'
            '''
        raw_query += f'''
        order by show.name,season.season_order_counter,episode.episode_order_counter
        '''
        if search_query:
            raw_query += f'''
            limit {config.search_results_per_shelf_limit}
            '''
        cursor = db.execute(sql_text(raw_query))
        results = [sql_row_to_api_result(dict(xx._mapping)) for xx in cursor]
        if first == True:
            return results[0]
        return results

def get_show_episode_by_id(ticket:dm.Ticket,episode_id: int):
    with DbSession() as db:
        return get_episodes_skip_orm(
            ticket=ticket,
            show_episode_id=episode_id,
            first=True
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
    include_specials:bool=True
):
    if shelf_id != None and not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        return get_episodes_skip_orm(
            ticket=ticket,
            shelf_id=shelf_id,
            show_id=show_id,
            show_season_id=show_season_id,
            search_query=search_query,
            include_specials=include_specials
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
        episodes = get_show_episode_list(ticket=ticket,shelf_id=shelf_id,show_season_id=season.id)
        if not episodes:
            return False
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.show_episode_id == episode_id
        ).delete()
        db.commit()
        if is_watched and not shelf_watched and not show_watched and not season_watched:
            watched_episodes = (
                db.query(dm.Watched).filter(
                    dm.Watched.shelf_id == shelf_id,
                    dm.Watched.show_id == show.id,
                    dm.Watched.show_season_id == season.id,
                    dm.Watched.show_episode_id != None
                ).distinct(dm.Watched.show_episode_id).all()
            )
            if len(watched_episodes) == len(episodes) - 1:
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
                db.refresh(dbm)
                return True
        if not is_watched:
            if shelf_watched:
                db_show.set_show_shelf_watched(ticket=ticket,shelf_id=shelf_id,is_watched=False)
            elif show_watched:
                db_show.set_show_watched(ticket=ticket,show_id=show.id,is_watched=False)
            elif season_watched:
                db_season.set_show_season_watched(ticket=ticket,season_id=season.id,is_watched=False)
                episodes_watched = []
                for other_episode in episodes:
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

def get_show_episode_watched(ticket:dm.Ticket,episode_id:int):
    episode = get_show_episode_by_id(ticket=ticket,episode_id=episode_id)
    if not episode:
        return False
    season = db_season.get_show_season_by_id(ticket=ticket,season_id=episode.season.id)
    if not season:
        return False
    season_watched = db_season.get_show_season_watched(ticket=ticket,season_id=season.id)
    if season_watched:
        return True
    with DbSession() as db:
        watched = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id == ticket.cduid,
            dm.Watched.shelf_id == season.show.shelf.id,
            dm.Watched.show_id == season.show.id,
            dm.Watched.show_season_id == season.id,
            dm.Watched.show_episode_id == episode_id
        ).first()
        return False if watched == None else True

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
