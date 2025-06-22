import random
import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.tag as db_tag
import database.operation.movie as db_movie
import database.operation.show as db_show
import database.operation.show_episode as db_episode
import database.operation.playlist as db_playlist

def create_playing_queue(ticket:dm.Ticket, source:str, length:int, content:str):
    with DbSession() as db:
        dbm = dm.PlayingQueue()
        dbm.client_device_user_id = ticket.cduid
        dbm.source = source
        dbm.content = content
        dbm.progress = 0
        dbm.length = length
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def delete_playing_queue(playing_queue_id:int):
    with DbSession() as db:
        db.query(dm.PlayingQueue).filter(
            dm.PlayingQueue.id == playing_queue_id
        ).delete()
        db.commit()
        return True

def update_playing_queue(ticket:dm.Ticket, source:str, progress:int):
    with DbSession() as db:
        existing = db.query(dm.PlayingQueue).filter(
            dm.PlayingQueue.client_device_user_id == ticket.cduid,
            dm.PlayingQueue.source == source
        ).first()
        if not existing:
            return None
        existing.progress = progress
        db.commit()

        return existing

def split_content(csv_content):
    entries = csv_content.split(',')
    results = []
    for entry in entries:
        parts = entry.split('-')
        if len(parts) == 2:
            results.append({
                'kind': parts[0],
                'id': int(parts[1])

            })
    return results

def get_playing_queue(
    ticket=dm.Ticket,
    shelf_id:int=None,
    show_id:int=None,
    show_season_id:int=None,
    tag_id:int=None,
    shuffle:bool=False,
    source:str=None):
    if source == None:
        if show_id:
            source = f'show-{show_id}'
        elif show_season_id:
            source = f'show_season-{show_season_id}'
        elif tag_id:
            source = f'tag-{tag_id}'
        if shuffle:
            source += '-shuffle'
    with DbSession() as db:
        existing = (
            db.query(dm.PlayingQueue).filter(
                dm.PlayingQueue.client_device_user_id == ticket.cduid,
                dm.PlayingQueue.source == source
            ).first()
        )
        if existing:
            if existing.progress >= existing.length:
                delete_playing_queue(playing_queue_id=existing.id)
            else:
                existing.content = split_content(existing.content)
                return existing
        length = 0
        queue_content = ''
        if show_id:
            episodes = db_episode.get_show_episode_list(ticket=ticket, shelf_id=shelf_id,show_id=show_id)
            episodes = [xx for xx in episodes if xx.season.season_order_counter > 0]
            if shuffle:
                random.shuffle(episodes)
                episodes = sorted(episodes, key=lambda xx:xx.watch_count.amount if xx.watch_count else 0)
            length = len(episodes)
            queue_content = ','.join([f'e-{xx.id}' for xx in episodes])
        elif show_season_id:
            episodes = db_episode.get_show_episode_list(ticket=ticket, shelf_id=shelf_id, show_season_id=show_season_id)
            if shuffle:
                random.shuffle(episodes)
                episodes = sorted(episodes, key=lambda xx:xx.watch_count.amount if xx.watch_count else 0)
            length = len(episodes)
            queue_content = ','.join([f'e-{xx.id}' for xx in episodes])
        elif tag_id:
            playlist = db_playlist.get_playlist_by_tag_id(ticket=ticket,tag_id=tag_id)
            queue_entries = []
            for entry in playlist:
                if entry.model_kind == 'movie':
                    queue_entries.append(entry)
                elif entry.model_kind == 'show':
                    episodes = db_episode.get_show_episode_list(ticket=ticket, shelf_id=shelf_id, show_id=entry.id)
                    for episode in episodes:
                        if episode.season.season_order_counter > 0:
                            queue_entries.append(episode)
            if shuffle:
                random.shuffle(queue_entries)
                queue_entries = sorted(queue_entries, key=lambda xx:xx.watch_count.amount if xx.watch_count else 0)
            items = []
            for entry in queue_entries:
                items.append(f'm-{entry.id}' if entry.model_kind == 'movie' else f'e-{entry.id}')
            length = len(queue_entries)
            queue_content = ','.join(items)
        playing_queue = create_playing_queue(
            ticket=ticket,
            source=source,
            length=length,
            content=queue_content
        )
        playing_queue.content = split_content(playing_queue.content)
        return playing_queue
