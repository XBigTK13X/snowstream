from db import db


def ingest_video(shelf_id: int, kind: str, file_path: str):
    video_file = db.op.get_video_file_by_path(file_path=file_path)
    if not video_file:
        return db.op.create_video_file(
            shelf_id=shelf_id, kind=kind, file_path=file_path
        )
    return video_file
