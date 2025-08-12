from database.operation.db_internal import dbi
import database.operation.shelf as db_shelf

def create_metadata_file(shelf_id: int, kind: str, local_path: str, xml_content:str):
    network_path = ''
    shelf = db_shelf.get_shelf_by_id(shelf_id=shelf_id)
    network_path = ''
    if shelf.network_path:
        network_path = local_path.replace(shelf.local_path,shelf.network_path)
    web_path = dbi.config.web_media_url + local_path
    with dbi.session() as db:
        dbm = dbi.dm.MetadataFile()
        dbm.local_path = local_path
        dbm.web_path = web_path
        dbm.network_path = network_path
        dbm.kind = kind
        dbm.shelf_id = shelf_id
        dbm.xml_content = xml_content
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_metadata_file_by_path(local_path: str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.MetadataFile).filter(dbi.dm.MetadataFile.local_path == local_path).first()
        )

def get_or_create_metadata_file(shelf_id: int, kind: str, local_path: str):
    metadata_file = get_metadata_file_by_path(local_path=local_path)
    if not metadata_file:
        with open(local_path) as read_handle:
            return create_metadata_file(
                shelf_id=shelf_id,
                kind=kind,
                local_path=local_path,
                xml_content=read_handle.read()
            )
    return metadata_file

def get_metadata_files_by_shelf(shelf_id: int):
    with dbi.session() as db:
        return db.query(dbi.dm.MetadataFile).filter(dbi.dm.MetadataFile.shelf_id == shelf_id)

def get_metadata_file_list(directory:str=None):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.MetadataFile)
            .options(dbi.orm.joinedload(dbi.dm.MetadataFile.movie))
            .options(dbi.orm.joinedload(dbi.dm.MetadataFile.show))
            .options(dbi.orm.joinedload(dbi.dm.MetadataFile.show_season))
            .options(dbi.orm.joinedload(dbi.dm.MetadataFile.show_episode))
        )

        if directory:
            query = query.filter(dbi.dm.MetadataFile.local_path.contains(directory))

        query = (query
            .order_by(dbi.dm.MetadataFile.local_path)
            .all()
        )

        return query

def update_metadata_file_content(metadata_file_id:int,xml_content:str):
    with dbi.session() as db:
        dbm = db.query(dbi.dm.MetadataFile).filter(dbi.dm.MetadataFile.id == metadata_file_id).first()
        if not dbm:
            return None
        dbm.xml_content = xml_content
        db.commit()
        return dbm
