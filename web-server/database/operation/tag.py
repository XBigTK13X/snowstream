import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import util

def create_tag(tag: am.Tag):
    with DbSession() as db:
        dbm = dm.User(**tag.model_dump())
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_tag_by_id(tag_id:int):
    with DbSession() as db:
        return db.query(dm.Tag).filter(dm.Tag.id == tag_id).first()

def upsert_tag(tag: am.Tag):
    existing = None
    if tag.id:
        existing = get_tag_by_id(tag.id)
    if not existing:
        return create_tag(tag)
    with DbSession() as db:
        existing = db.query(dm.Tag).filter(dm.Tag.id == tag.id).update(tag.model_dump())
        db.commit()        
        return existing

def get_tag_list():
    with DbSession() as db:
        return db.query(dm.Tag).all()

def delete_tag_by_id(tag_id:int):
    with DbSession() as db:
        deleted = db.query(dm.Tag).filter(dm.Tag.id == tag_id).delete()
        db.commit()
        return deleted    