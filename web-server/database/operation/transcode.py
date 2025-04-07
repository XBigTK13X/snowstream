import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm


def create_transcode_session(
    cduid:int,
    transcode_directory:str,
    transcode_file:str,
    video_file_id:int=None,
    streamable_id:int=None,
    stream_port:int=None
):
    with DbSession() as db:
        dbm = dm.TranscodeSession()
        dbm.client_device_user_id = cduid
        dbm.video_file_id = video_file_id
        dbm.streamable_id = streamable_id
        dbm.transcode_directory = transcode_directory
        dbm.transcode_file = transcode_file
        dbm.stream_port = stream_port
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_transcode_process_id(
    transcode_session_id:int,
    process_id:int
):
    with DbSession() as db:
        transcode_session = db.query(dm.TranscodeSession).filter(dm.TranscodeSession.id == transcode_session_id).first()
        if not transcode_session:
            return False
        transcode_session.process_id = process_id
        db.commit()
        return True

def get_transcode_session_by_id(
    transcode_session_id:int
):
    with DbSession() as db:
        return (
            db.query(dm.TranscodeSession)
            .filter(
                dm.TranscodeSession.id == transcode_session_id
            )
            .first()
        )

def get_transcode_session_list():
    with DbSession() as db:
        return db.query(dm.TranscodeSession).all()

def delete_transcode_session(
    transcode_session_id:int
):
    with DbSession() as db:
        result = db.query(dm.TranscodeSession).filter(
            dm.TranscodeSession.id == transcode_session_id
        ).delete()
        db.commit()
        return result