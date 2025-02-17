import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def set_watch_status(
    client_device_id:int,
    process_id:int,
    transcode_directory:str,
    transcode_file:str,
    video_file_id:int=None,
    streamable_id:int=None
):
    with DbSession() as db:
        dbm = dm.TranscodeSession()
        dbm.client_device_id = client_device_id
        dbm.video_file_id = video_file_id
        dbm.streamable_id = streamable_id
        dbm.process_id = process_id
        dbm.transcode_directory = transcode_directory
        dbm.transcode_file = transcode_file
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm
