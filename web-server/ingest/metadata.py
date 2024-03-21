from db import db


def ingest_metadata(shelf_id: int, kind: str, file_path: str):
    metadata_file = db.op.get_metadata_file_by_path(file_path=file_path)
    if not metadata_file:
        return db.op.create_metadata_file(
            shelf_id=shelf_id, kind=kind, file_path=file_path
        )
    return metadata_file
