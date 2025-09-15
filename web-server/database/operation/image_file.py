from database.operation.db_internal import dbi
import snow_media.image
import database.operation.shelf as db_shelf

def create_image_file(shelf_id: int, kind: str, local_path: str):
    local_thumbnail_path = snow_media.image.create_thumbnail(local_path)
    thumbnail_web_path = dbi.config.web_media_url + local_thumbnail_path
    if local_thumbnail_path[0] != '/':
        thumbnail_web_path = dbi.config.web_media_url + '/' + local_thumbnail_path

    shelf = db_shelf.get_shelf_by_id(shelf_id=shelf_id)
    network_path = ''
    if shelf.network_path:
        network_path = local_path.replace(shelf.local_path,shelf.network_path)
    web_path = dbi.config.web_media_url + local_path
    with dbi.session() as db:
        dbm = dbi.dm.ImageFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        dbm.thumbnail_web_path = thumbnail_web_path
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_image_file_by_path(local_path: str):
    with dbi.session() as db:
        return db.query(dbi.dm.ImageFile).filter(dbi.dm.ImageFile.local_path == local_path).first()

def get_or_create_image_file(shelf_id: int, kind: str, local_path: str):
    image_file = get_image_file_by_path(local_path=local_path)
    if not image_file:
        return create_image_file(
            shelf_id=shelf_id,
            kind=kind,
            local_path=local_path
        )
    return image_file

def get_image_files_by_shelf(shelf_id: int):
    with dbi.session() as db:
        return db.query(dbi.dm.ImageFile).filter(dbi.dm.ImageFile.shelf_id == shelf_id).all()

def get_image_file_list(directory:str=None):
    with dbi.session() as db:
        query = db.query(dbi.dm.ImageFile)
        if directory:
            query = query.filter(dbi.dm.ImageFile.local_path.contains(directory))
        return query.all()