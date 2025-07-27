import database.db_models as dm
from database.sql_alchemy import DbSession, desc
from sqlalchemy import text as sql_text
from datetime import datetime, timezone
from settings import config



def create_cached_text(key: str, data: str, ttl_seconds: int):
    with DbSession() as db:
        dbm = dm.CachedText()
        dbm.key = key
        dbm.data = data
        dbm.time_to_live_seconds = ttl_seconds
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm.data


def get_cached_text_by_key(key: str):
    with DbSession() as db:
        result = db.query(dm.CachedText).filter(dm.CachedText.key == key).first()
        if not result:
            return None
        if (result.updated_at.timestamp() - datetime.now(timezone.utc).timestamp()) > result.time_to_live_seconds:
            db.query(dm.CachedText).filter(dm.CachedText.key == key).delete()
            db.commit()
            return None
        return result.data


def update_cached_text(key: str, data: str):
    with DbSession() as db:
        dbm = db.query(dm.CachedText).filter(dm.CachedText.key == key).first()
        dbm.data = data
        db.commit()
        return dbm.data


def upsert_cached_text(key: str, data: str, ttl_seconds:int=None):
    if not ttl_seconds:
        ttl_seconds = config.cached_text_ttl_seconds
    cached_text = get_cached_text_by_key(key=key)
    if cached_text:
        return update_cached_text(key=key, data=data)
    return create_cached_text(key=key, data=data, ttl_seconds=ttl_seconds)

def get_cached_text_list(search_query:str):
    with DbSession() as db:
        return (
            db.query(dm.CachedText)
            .filter(dm.CachedText.key.ilike(f'%{search_query}%'))
            .order_by(desc(dm.CachedText.updated_at))
            .all()
        )

def delete_all_cached_text():
    with DbSession() as db:
        db.execute(sql_text('truncate cached_text;'))
        db.commit()
        return True