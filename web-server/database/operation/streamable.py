import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log


def create_streamable(stream_source_id: int, url: str, name: str):
    with DbSession() as db:
        dbm = dm.Streamable()
        dbm.name = name
        dbm.url = url
        dbm.stream_source_id = stream_source_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm
