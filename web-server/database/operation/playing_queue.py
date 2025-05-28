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

def delete_playing_queue(ticket:dm.Ticket,playing_queue_id:int):
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
        results.append({
            'kind': parts[0],
            'id': int(parts[1])
        })
    return results

def get_playing_queue(
    ticket=dm.Ticket,
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
            episodes = db_episode.get_show_episode_list_by_show(ticket=ticket, show_id=show_id)
            length = len(episodes)
            queue_content = ','.join([f'episode-{xx.id}' for xx in episodes])
        elif show_season_id:
            episodes = db_episode.get_show_episode_list_by_season(ticket=ticket, show_season_id=show_season_id)
            length = len(episodes)
            queue_content = ','.join([f'episode-{xx.id}' for xx in episodes])
        elif tag_id:
            playlist = db_playlist.get_playlist_by_tag_id(ticket=ticket,tag_id=tag_id)
            queue_content = []
            for entry in playlist:
                if entry.kind == 'movie':
                    queue_content += f'movie-{entry.id}'
                    length += 1
                elif entry.kind == 'show':
                    episodes = db_episode.get_show_episode_list_by_show(ticket=ticket, show_id=show_id)
                    length += len(episodes)
                    queue_content += [f'episode-{xx.id}' for xx in episodes]
            queue_content = ','.join(queue_content)
        playing_queue = create_playing_queue(ticket=ticket,source=source,length=length,content=queue_content)
        playing_queue.content = split_content(playing_queue.content)
        return playing_queue
