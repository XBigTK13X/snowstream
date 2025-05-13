import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_video_file(shelf_id: int, kind: str, local_path: str, web_path: str, network_path: str, ffprobe_pruned_json: str):
    with DbSession() as db:
        dbm = dm.VideoFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        dbm.ffprobe_pruned_json = ffprobe_pruned_json
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_video_file_by_path(local_path: str):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.local_path == local_path).first()

def get_or_create_video_file(shelf_id: int, kind: str, local_path: str, web_path: str, network_path: str, ffprobe_pruned_json: str):
    video_file = get_video_file_by_path(local_path=local_path)
    if not video_file:
        return create_video_file(
            shelf_id=shelf_id, kind=kind, local_path=local_path,
            web_path=web_path, network_path=network_path,ffprobe_pruned_json=ffprobe_pruned_json
        )
    return video_file

def get_video_file_by_id(video_file_id: int):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.id == video_file_id).first()


def get_video_files_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.shelf_id == shelf_id)

def get_video_files_list():
    with DbSession() as db:
        return db.query(dm.VideoFile).all()