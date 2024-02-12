import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm

def create_show(name: str, directory: str):
    with DbSession() as db:
        dbm = dm.Show()
        dbm.name = name
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_by_name(name: str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.name == name).first()

def add_show_to_shelf(show_id:int, shelf_id:int):
    with DbSession() as db:
        dbm = dm.ShowShelf()
        dbm.shelf_id = shelf_id
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_list_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.Show).join(dm.ShowShelf).filter(dm.ShowShelf.shelf_id == shelf_id).all()

def create_show_season(show_id:int, season_order_counter: int):
    with DbSession() as db:
        dbm = dm.ShowSeason()
        dbm.season_order_counter = season_order_counter
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_season(show_id:int,season_order_counter:int):
    with DbSession() as db:
        return db.query(dm.ShowSeason).filter(dm.ShowSeason.show_id == show_id).filter(dm.ShowSeason.season_order_counter == season_order_counter).first()

def get_show_season_list(show_id:int):
    with DbSession() as db:
        return db.query(dm.ShowSeason).filter(dm.ShowSeason.show_id == show_id).all()

def create_show_episode(show_season_id: int, episode_order_counter:int):
    with DbSession() as db:
        dbm = dm.ShowEpisode()
        dbm.episode_order_counter = episode_order_counter
        dbm.show_season_id = show_season_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_season_episode_details_by_id(episode_id:int):
    with DbSession() as db:
        return db.query(dm.ShowEpisode).options(sorm.joinedload(dm.ShowEpisode.video_files)).options(sorm.joinedload(dm.ShowEpisode.season)).options(sorm.joinedload(dm.ShowEpisode.season.show)).options(sorm.joinedload(dm.ShowEpisode.season.show.shelf)).filter(dm.ShowEpisode.id == episode_id).first()
        #show.video_files = db.scalars(sa.select(dm.ShowEpisodeVideoFile).filter(dm.ShowEpisodeVideoFile.episode_id == episode_id)).all();
        #return show

def get_season_episode(show_season_id:int, episode_order_counter:int):
    with DbSession() as db:
        return db.query(dm.ShowEpisode).filter(dm.ShowEpisode.show_season_id == show_season_id).filter(dm.ShowEpisode.episode_order_counter == episode_order_counter).first()

def get_season_episode_list(show_season_id:int):
    with DbSession() as db:
        return db.query(dm.ShowEpisode).filter(dm.ShowEpisode.show_season_id == show_season_id).all()

def create_show_episode_video_file(show_episode_id:int, video_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowEpisodeVideoFile()
        dbm.show_episode_id = show_episode_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_episode_video_file(show_episode_id: int, video_file_id: int):
    with DbSession() as db:
        return db.query(dm.ShowEpisodeVideoFile).filter(dm.ShowEpisodeVideoFile.show_episode_id == show_episode_id).filter(dm.ShowEpisodeVideoFile.video_file_id == video_file_id).first()
