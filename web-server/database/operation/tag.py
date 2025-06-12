import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import util

def create_tag(tag: am.Tag):
    with DbSession() as db:
        dbm = dm.Tag(**tag.model_dump())
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_tag_by_id(tag_id:int):
    with DbSession() as db:
        return db.query(dm.Tag).filter(dm.Tag.id == tag_id).first()

def get_tag_by_name(tag_name:str):
    with DbSession() as db:
        return db.query(dm.Tag).filter(dm.Tag.name == tag_name).first()

def upsert_tag(tag: am.Tag):
    existing = None
    if tag.id:
        existing = get_tag_by_id(tag.id)
    elif tag.name:
        existing = get_tag_by_name(tag.name)
    if not existing:
        return create_tag(tag)
    with DbSession() as db:
        existing = db.query(dm.Tag).filter(dm.Tag.id == existing.id).update(tag.model_dump())
        db.commit()
        return existing

def get_tag_list(ticket:dm.Ticket=None):
    with DbSession() as db:
        query = db.query(dm.Tag)
        if ticket != None and ticket.tag_ids != None:
            query = query.filter(dm.Tag.id.in_(ticket.tag_ids)).order_by(dm.Tag.name)
        return query.all()

def delete_tag_by_id(tag_id:int):
    with DbSession() as db:
        deleted = db.query(dm.Tag).filter(dm.Tag.id == tag_id).delete()
        db.commit()
        return deleted