from database.operation.db_internal import dbi

def create_cached_text(key: str, data: str, ttl_seconds: int):
    with dbi.session() as db:
        dbm = dbi.dm.CachedText()
        dbm.key = key
        dbm.data = data
        dbm.time_to_live_seconds = ttl_seconds
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm.data


def get_cached_text_by_key(key: str):
    with dbi.session() as db:
        result = db.query(dbi.dm.CachedText).filter(dbi.dm.CachedText.key == key).first()
        if not result:
            return None
        if (result.updated_at.timestamp() - dbi.datetime.now(dbi.timezone.utc).timestamp()) > result.time_to_live_seconds:
            db.query(dbi.dm.CachedText).filter(dbi.dm.CachedText.key == key).delete()
            db.commit()
            return None
        return result.data


def update_cached_text(key: str, data: str):
    with dbi.session() as db:
        dbm = db.query(dbi.dm.CachedText).filter(dbi.dm.CachedText.key == key).first()
        dbm.data = data
        db.commit()
        return dbm.data


def upsert_cached_text(key: str, data: str, ttl_seconds:int=None):
    if not ttl_seconds:
        ttl_seconds = dbi.config.cached_text_ttl_seconds
    cached_text = get_cached_text_by_key(key=key)
    if cached_text:
        return update_cached_text(key=key, data=data)
    return create_cached_text(key=key, data=data, ttl_seconds=ttl_seconds)

def get_cached_text_list(search_query:str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.CachedText)
            .filter(dbi.dm.CachedText.key.ilike(f'%{search_query}%'))
            .order_by(dbi.desc(dbi.dm.CachedText.updated_at))
            .all()
        )

def delete_all_cached_text():
    with dbi.session() as db:
        db.execute(dbi.sql_text('truncate cached_text;'))
        db.commit()
        return True