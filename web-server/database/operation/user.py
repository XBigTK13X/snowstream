import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import util

def create_user(user: am.User):
    with DbSession() as db:
        model_dump = user.model_dump()
        model_dump['hashed_password'] = util.get_password_hash(model_dump['raw_password'])
        del model_dump['raw_password']
        del model_dump['id']
        dbm = dm.User(**model_dump)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def upsert_user(user: am.User):
    existing = None
    if user.id:
        existing = get_user_by_id(user.id)
    elif user.username:
        existing = get_user_by_name(user.username)
    if not existing:
        return create_user(user)
    with DbSession() as db:
        old_hash = existing.hashed_password
        model_dump = user.model_dump()
        if user.raw_password != '':
            model_dump['hashed_password'] = util.get_password_hash(model_dump['raw_password'])
        else:        
            model_dump['hashed_password'] = old_hash
        del model_dump['raw_password']
        existing = db.query(dm.User).filter(dm.User.id == existing.id).update(model_dump)
        db.commit()        
        return existing

def get_user_by_id(user_id:int,include_access=False):    
    with DbSession() as db:
        query = db.query(dm.User)
        if include_access:
            query = query.options(
                sorm.joinedload(dm.User.access_tags)
            ).options(
                sorm.joinedload(dm.User.access_shelves)
            ).options(
                sorm.joinedload(dm.User.access_stream_sources)
            )
        return query.filter(dm.User.id == user_id).first()

def get_user_by_name(username: str,include_access=False):
    with DbSession() as db:
        query = db.query(dm.User)
        if include_access:
            query = query.options(
                sorm.joinedload(dm.User.access_tags)
            ).options(
                sorm.joinedload(dm.User.access_shelves)
            ).options(
                sorm.joinedload(dm.User.access_stream_sources)
            )
        return query.filter(dm.User.username == username).first()


def get_user_list():
    with DbSession() as db:
        return db.query(dm.User).all()

def delete_user_by_id(user_id:int):
    with DbSession() as db:
        deleted = db.query(dm.User).filter(dm.User.id == user_id).delete()
        db.commit()
        return deleted    

def save_user_access(user_access:am.UserAccess):
    user_tags = []
    for tag_id in user_access.tag_ids:
        user_tag = dm.UserTag()
        user_tag.user_id = user_access.user_id
        user_tag.tag_id = tag_id
        user_tags.append({'user_id':user_access.user_id,'tag_id':tag_id})
    user_shelves = []
    for shelf_id in user_access.shelf_ids:
        user_shelf = dm.UserShelf()
        user_shelf.user_id = user_access.user_id
        user_shelf.shelf_id = shelf_id
        user_shelves.append({'user_id':user_access.user_id,'shelf_id':shelf_id})
    user_stream_sources = []
    for stream_source_id in user_access.stream_source_ids:
        user_stream_source = dm.UserStreamSource()
        user_stream_source.user_id = user_access.user_id
        user_stream_source.stream_source_id = stream_source_id
        user_stream_sources.append({'user_id':user_access.user_id,'stream_source_id':stream_source_id})
    with DbSession() as db:
        db.query(dm.UserTag).filter(dm.UserTag.user_id == user_access.user_id).delete()
        db.query(dm.UserShelf).filter(dm.UserShelf.user_id == user_access.user_id).delete()
        db.query(dm.UserStreamSource).filter(dm.UserStreamSource.user_id == user_access.user_id).delete()
        db.commit()
        db.bulk_insert_mappings(dm.UserTag, user_tags)
        db.bulk_insert_mappings(dm.UserShelf, user_shelves)
        db.bulk_insert_mappings(dm.UserStreamSource, user_stream_sources)
        db.commit()
    return True