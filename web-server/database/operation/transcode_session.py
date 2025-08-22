from database.operation.db_internal import dbi

def create_transcode_session(
    cduid:int,
    transcode_directory:str=None,
    transcode_file:str=None,
    video_file_id:int=None,
    streamable_id:int=None,
    stream_port:int=None
):
    with dbi.session() as db:
        dbm = dbi.dm.TranscodeSession()
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
    with dbi.session() as db:
        transcode_session = db.query(dbi.dm.TranscodeSession).filter(dbi.dm.TranscodeSession.id == transcode_session_id).first()
        if not transcode_session:
            return False
        transcode_session.process_id = process_id
        db.commit()
        return True

def get_transcode_session_by_id(
    transcode_session_id:int
):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.TranscodeSession)
            .filter(
                dbi.dm.TranscodeSession.id == transcode_session_id
            )
            .first()
        )

def get_transcode_session(
    cduid:int,
    video_file_id:int=None,
    streamable_id:int=None
):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.TranscodeSession)
            .filter(
                dbi.dm.TranscodeSession.client_device_user_id == cduid,
                dbi.dm.TranscodeSession.streamable_id == streamable_id,
                dbi.dm.TranscodeSession.video_file_id == video_file_id
            ).first()
        )

def get_transcode_session_list():
    with dbi.session() as db:
        return db.query(dbi.dm.TranscodeSession).all()

def delete_transcode_session(
    transcode_session_id:int
):
    with dbi.session() as db:
        result = db.query(dbi.dm.TranscodeSession).filter(
            dbi.dm.TranscodeSession.id == transcode_session_id
        ).delete()
        db.commit()
        return result

def delete_all_transcode_sessions():
    with dbi.session() as db:
        db.execute(dbi.sql_text('truncate transcode_session;'))
        db.commit()
        return True