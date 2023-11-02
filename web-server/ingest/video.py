from db import db


def ingest_video(kind: str, file_path: str):
    if not db.get_video_file_by_path(file_path=file_path):
        db.create_video_file(kind=kind, file_path=file_path)
