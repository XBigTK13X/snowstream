import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
import json
import ffmpeg
import database.operation.shelf as db_shelf
from settings import config
import os

def create_video_file(
    shelf_id: int,
    kind: str,
    local_path: str,
    ffprobe_pruned_json: str
    ):
    shelf = db_shelf.get_shelf_by_id(shelf_id=shelf_id)
    network_path = ''
    if shelf.network_path:
        network_path = local_path.replace(shelf.local_path,shelf.network_path)
    web_path = config.web_media_url + local_path
    version = None
    file_name = os.path.basename(local_path)
    if '[' in file_name and ']' in file_name:
        version = file_name.split('[')[-1].split(']')[0]
    with DbSession() as db:
        dbm = dm.VideoFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        dbm.ffprobe_pruned_json = ffprobe_pruned_json
        dbm.version = version
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_video_file_by_path(local_path: str):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.local_path == local_path).first()

def get_or_create_video_file(shelf_id: int, kind: str, local_path: str):
    video_file = get_video_file_by_path(local_path=local_path)
    if not video_file:
        ffprobe = json.dumps(ffmpeg.ffprobe_media(local_path)['parsed'])
        return create_video_file(
            shelf_id=shelf_id,
            kind=kind,
            local_path=local_path,
            ffprobe_pruned_json=ffprobe
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