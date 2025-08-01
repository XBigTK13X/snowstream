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
    snowstream_info_json: str,
    ffprobe_raw_json:str,
    mediainfo_raw_json:str
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
        dbm.snowstream_info_json = snowstream_info_json
        dbm.ffprobe_raw_json = ffprobe_raw_json
        dbm.mediainfo_raw_json = mediainfo_raw_json
        dbm.version = version
        dbm.name = os.path.splitext(file_name)[0]
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
        info = ffmpeg.path_to_info_json(media_path=local_path)
        return create_video_file(
            shelf_id=shelf_id,
            kind=kind,
            local_path=local_path,
            snowstream_info_json=info['snowstream_info'],
            ffprobe_raw_json=info['ffprobe_raw'],
            mediainfo_raw_json=info['mediainfo_raw']
        )

    return video_file

def update_video_file_info(
    video_file_id:int,
    snowstream_info_json:str,
    ffprobe_json:str=None,
    mediainfo_json:str=None
):
    with DbSession() as db:
        video_file = db.query(dm.VideoFile).filter(dm.VideoFile.id == video_file_id).first()
        video_file.snowstream_info_json = snowstream_info_json
        if ffprobe_json:
            video_file.ffprobe_raw_json = ffprobe_json
        if mediainfo_json:
            video_file.mediainfo_raw_json = mediainfo_json
        db.commit()
        return video_file

def get_video_file_by_id(video_file_id: int):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.id == video_file_id).first()

def get_video_files_by_shelf(shelf_id: int):
    with DbSession() as db:
        return db.query(dm.VideoFile).filter(dm.VideoFile.shelf_id == shelf_id)

def get_video_file_list(directory:str=None):
    with DbSession() as db:
        query = db.query(dm.VideoFile)

        if directory:
            query = query.filter(dm.VideoFile.local_path.contains(directory))

        query = (query
            .order_by(dm.VideoFile.local_path)
            .all()
        )

        return query