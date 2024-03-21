from db import db


def ingest_image(shelf_id: int, kind: str, file_path: str):
    image_file = db.op.get_image_file_by_path(file_path=file_path)
    if not image_file:
        return db.op.create_image_file(
            shelf_id=shelf_id, kind=kind, file_path=file_path
        )
    return image_file
