import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_show(name: str):
    with DbSession() as db:
        dbm = dm.Show()
        dbm.name = name
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_by_name(name: str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.name == name).first()

def create_show_season(show_id:int, season_index: int):
    pass

def create_show_episode(show_id:int, season_index: int, episode_index:int):
    pass

def add_video_file_to_show_episode(episode_id:int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowVideoFile()
        dbm.episode_id = episode_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm