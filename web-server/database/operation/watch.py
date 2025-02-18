import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm

def watched_to_bool(watched:dm.Watched):
    return False if watched == None else True

def set_watch_status(
    status:am.WatchStatus,
    cduid:int
):
    with DbSession() as db:
        if status.status == True:    
            dbm = dm.Watched()
            dbm.client_device_user_id = cduid
            dbm.movie_id = status.movie_id
            dbm.show_episode_id = status.show_episode_id
            dbm.streamable_id = status.streamable_id
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
            return dbm
        if status.status == False:
            if status.movie_id:
                deleted = db.query(dm.Watched).filter(dm.Watched.movie_id == status.movie_id).delete()
                db.commit()
                return deleted
            if status.show_episode_id:
                deleted = db.query(dm.Watched).filter(dm.Watched.show_episode_id == status.show_episode_id).delete()
                db.commit()
                return deleted    
            if status.streamable_id:
                deleted = db.query(dm.Watched).filter(dm.Watched.streamable_id == status.streamable_id).delete()
                db.commit()
                return deleted

def get_movie_watch_status(
    cduid:int,
    movie_id:int
):
    with DbSession() as db:
        watched = (
            db.query(dm.Watched)
            .filter(
                dm.Watched.client_device_user_id == cduid,
                dm.Watched.movie_id == movie_id
            )
            .first()
        )
        return watched_to_bool(watched)