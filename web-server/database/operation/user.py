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
    existing_user = None
    if user.id:
        existing_user = get_user_by_id(user.id)
    elif user.username:
        existing_user = get_user_by_name(user.username)
    if not existing_user:
        return create_user(user)
    with DbSession() as db:
        old_hash = existing_user.hashed_password
        model_dump = user.model_dump()
        if user.raw_password != '':
            model_dump['hashed_password'] = util.get_password_hash(model_dump['raw_password'])
        else:        
            model_dump['hashed_password'] = old_hash
        del model_dump['raw_password']
        existing_user = db.query(dm.User).filter(dm.User.id == existing_user.id).update(model_dump)
        db.commit()        
        return existing_user

def get_user_by_id(user_id:int):
    with DbSession() as db:
        return db.query(dm.User).filter(dm.User.id == user_id).first()

def get_user_by_name(username: str):
    with DbSession() as db:
        return db.query(dm.User).filter(dm.User.username == username).first()


def get_user_list():
    with DbSession() as db:
        return db.query(dm.User).all()

def delete_user_by_id(user_id:int):
    with DbSession() as db:
        deleted = db.query(dm.User).filter(dm.User.id == user_id).delete()
        db.commit()
        return deleted    

def get_user_access_by_id(user_id:int):
    with DbSession() as db:
        return