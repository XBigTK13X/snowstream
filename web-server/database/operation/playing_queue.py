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

def get_playing_queue(
    ticket=dm.Ticket,
    show_id:int=None,
    show_season_id:int=None,
    tag_id:int=None,
    shuffle:bool=False):
    source = None
    if show_id:
        source = f'show-{show_id}'
    if show_season_id:
        source = f'show_season-{show_season_id}'
    if tag_id:
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
                return existing
        # TODO Build the appropriate queue, store it, and return
