import util
import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.show as db_show
import database.operation.show_season as db_season

def get_show_episode_list_by_shelf(ticket:dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with DbSession() as db:
        query = (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.season.show.shelf.id == shelf_id)
            .options(sorm.joinedload(dm.ShowEpisode.season))
            .options(sorm.joinedload(dm.ShowEpisode.season.show))
            .options(sorm.joinedload(dm.ShowEpisode.tags))
        )
        episodes = query.all()
        results = []
        for episode in episodes:
            if not ticket.is_allowed(tag_provider=episode.get_tag_ids):
                continue
            episode = dm.set_primary_images(episode)
            episode.name = util.get_episode_title(episode)
            results.append(episode)
        return results

def create_show_episode(show_season_id: int, episode_order_counter: int):
    with DbSession() as db:
        dbm = dm.ShowEpisode()
        dbm.episode_order_counter = episode_order_counter
        dbm.show_season_id = show_season_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_episode_list_by_show(ticket:dm.Ticket,show_id:int):
    show = db_show.get_show_by_id(ticket=ticket,show_id=show_id)
    if not show:
        return []
    seasons = db_season.get_show_season_list_by_show_id(ticket=ticket,show_id=show_id)
    if not seasons:
        return []
    season_ids = [xx.id for xx in seasons]
    with DbSession() as db:
        query = (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.show_season_id.in_(season_ids))
            .options(sorm.joinedload(dm.ShowEpisode.season))
            .options(sorm.joinedload(dm.ShowEpisode.season.show))
            .options(sorm.joinedload(dm.ShowEpisode.tags))
        )
        episodes = query.all()
        results = []
        for episode in episodes:
            if not ticket.is_allowed(tag_provider=episode.get_tag_ids):
                continue
            episode = dm.set_primary_images(episode)
            episode.name = util.get_episode_title(episode)
            results.append(episode)
        return results

def get_show_episode_by_id(ticket:dm.Ticket,episode_id: int):
    with DbSession() as db:
        query = (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.id == episode_id)
            .options(sorm.joinedload(dm.ShowEpisode.video_files))
            .options(sorm.joinedload(dm.ShowEpisode.image_files))
            .options(sorm.joinedload(dm.ShowEpisode.metadata_files))
            .options(sorm.joinedload(dm.ShowEpisode.tags))
            .options(sorm.joinedload(dm.ShowEpisode.season))
        )
        episode = query.first()
        season = db_season.get_show_season_by_id(ticket=ticket,season_id=episode.season.id)
        if not season:
            return None
        if not ticket.is_allowed(tag_provider=episode.get_tag_ids):
            return None
        episode = dm.set_primary_images(episode)            
        episode.name = util.get_episode_title(episode)
        return episode


def get_show_episode_by_season_order(show_season_id: int, episode_order_counter: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowEpisode)
            .options(sorm.joinedload(dm.ShowEpisode.tags))
            .filter(dm.ShowEpisode.show_season_id == show_season_id)
            .filter(dm.ShowEpisode.episode_order_counter == episode_order_counter)
            .first()
        )

def get_show_episode_list_by_season(ticket:dm.Ticket,show_season_id: int):
    season = db_season.get_show_season_by_id(ticket=ticket,season_id=show_season_id)
    if not season:
        return []
    with DbSession() as db:
        query = (
            db.query(dm.ShowEpisode)
            .filter(dm.ShowEpisode.show_season_id == show_season_id)            
            .order_by(dm.ShowEpisode.episode_order_counter)
        )
        episodes = query.all()
        results = []
        for episode in episodes:
            if not ticket.is_allowed(tag_provider=episode.get_tag_ids):
                continue
            episode = dm.set_primary_images(episode)
            episode.name = util.get_episode_title(episode)
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

def get_partial_show_episode_list(ticket:dm.Ticket,season_id:int,only_watched:bool=True):
    with DbSession() as db:
        episodes = get_show_episode_list_by_season(ticket=ticket,show_season_id=season_id)
        if not episodes:
            return []
        season = db_season.get_show_season_by_id(ticket=ticket,season_id=season_id)
        if not season:
            return []
        show = db_show.get_show_by_id(ticket=ticket,show_id=season.show.id)
        if not show:
            return []
        shelf_watched = db_show.get_show_shelf_watched(ticket=ticket,shelf_id=show.shelf.id)        
        if shelf_watched:
            return episodes if only_watched else []
        show_watched = db_show.get_show_watched(ticket=ticket,show_id=show.id)
        if show_watched:
            return episodes if only_watched else []        
        season_watched = db_season.get_show_season_watched(ticket=ticket,season_id=season_id)
        if season_watched:
            return episodes if only_watched else []        
        watched_episodes = db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.shelf_id == show.shelf.id,
            dm.Watched.show_id == show.id,
            dm.Watched.show_season_id == season_id,
            dm.Watched.show_episode_id != None
        ).distinct(dm.Watched.show_episode_id).all()
        watched_ids = [xx.show_episode_id for xx in watched_episodes]
        if only_watched:
            return [xx for xx in episodes if xx.id in watched_ids]
        return [xx for xx in episodes if not xx.id in watched_ids]

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
        episodes = get_show_episode_list_by_season(ticket=ticket,show_season_id=season.id)
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
            if show_watched:
                db_show.set_show_watched(ticket=ticket,show_id=show.id,is_watched=False)
            if season_watched:
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
    episode = get_show_episode_by_id(ticket=ticket,episode_id=watch_progress.show_episode_id)
    if not episode:
        return False
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
    return True