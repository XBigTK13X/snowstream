import database.db_models as dm
from database.sql_alchemy import DbSession


def create_cached_text(key: str, data: str):
    with DbSession() as db:
        dbm = dm.CachedText()
        dbm.key = key
        dbm.data = data
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm.data


def get_cached_text_by_key(key: str):
    with DbSession() as db:
        result = db.query(dm.CachedText).filter(dm.CachedText.key == key).first()
        if not result:
            return None
        return result.data


def update_cached_text(key: str, data: str):
    with DbSession() as db:
        dbm = db.query(dm.CachedText).filter(dm.CachedText.key == key).first()
        dbm.data = data
        db.commit()
        return dbm.data
