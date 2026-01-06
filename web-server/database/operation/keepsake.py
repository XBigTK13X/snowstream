from database.operation.db_internal import dbi
import json

def create_keepsake(directory: str):
    with dbi.session() as db:
        dbm = dbi.dm.Keepsake()
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def add_keepsake_to_shelf(keepsake_id: int, shelf_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.KeepsakeShelf()
        dbm.shelf_id = shelf_id
        dbm.keepsake_id = keepsake_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_keepsake_by_directory(directory:str,load_files:bool=True):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Keepsake)
            .filter(dbi.dm.Keepsake.directory == directory)
        )
        if load_files:
            query = (
                query
                .options(dbi.orm.joinedload(dbi.dm.Keepsake.video_files))
                .options(dbi.orm.joinedload(dbi.dm.Keepsake.image_files))
                .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
            )
        return query.first()

def get_keepsake_by_id(keepsake_id:int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Keepsake)
            .filter(dbi.dm.Keepsake.id == keepsake_id)
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.video_files))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
            .first()
        )

def get_keepsake_list_by_directory(directory:str,load_files:bool=True):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Keepsake)
            .filter(dbi.dm.Keepsake.directory.contains(directory))
        )
        if load_files:
            query = (
                query
                .options(dbi.orm.joinedload(dbi.dm.Keepsake.video_files))
                .options(dbi.orm.joinedload(dbi.dm.Keepsake.image_files))
                .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
            )
        return query.order_by(
            dbi.func.length(dbi.dm.Keepsake.directory),
            dbi.dm.Keepsake.directory
        ).all()

def get_keepsake_subdirectories(directory: str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Keepsake.directory)
            .filter(dbi.dm.Keepsake.directory.contains(directory))
            .all()
        )

def create_keepsake_video_file(keepsake_id: int, video_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.KeepsakeVideoFile()
        dbm.keepsake_id = keepsake_id
        dbm.video_file_id = video_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_keepsake_video_file(keepsake_id: int, video_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.KeepsakeVideoFile)
            .filter(dbi.dm.KeepsakeVideoFile.keepsake_id == keepsake_id)
            .filter(dbi.dm.KeepsakeVideoFile.video_file_id == video_file_id)
            .first()
        )

def create_keepsake_image_file(keepsake_id: int, image_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.KeepsakeImageFile()
        dbm.keepsake_id = keepsake_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_keepsake_image_file(keepsake_id: int, image_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.KeepsakeImageFile)
            .filter(dbi.dm.KeepsakeImageFile.keepsake_id == keepsake_id)
            .filter(dbi.dm.KeepsakeImageFile.image_file_id == image_file_id)
            .first()
        )

def get_keepsake_list(search_query: str):

    with dbi.session() as db:
        directories = (
            db.query(dbi.dm.Keepsake)
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
            .filter(dbi.dm.Keepsake.directory.ilike(f'%{search_query}%'))
            .all()
        )

        images = (
            db.query(dbi.dm.KeepsakeImageFile)
            .join(dbi.dm.KeepsakeImageFile.image_file)
            .filter(dbi.dm.ImageFile.local_path.ilike(f'%{search_query}%'))
            .options(dbi.orm.contains_eager(dbi.dm.KeepsakeImageFile.image_file))
            .all()
        )

        videos = (
            db.query(dbi.dm.KeepsakeVideoFile)
            .join(dbi.dm.KeepsakeVideoFile.video_file)
            .filter(dbi.dm.VideoFile.local_path.ilike(f'%{search_query}%'))
            .options(dbi.orm.contains_eager(dbi.dm.KeepsakeVideoFile.video_file))
            .all()
        )

        if directories:
            for xx in directories:
                xx.display = xx.directory.replace(xx.shelf.local_path+'/','')

        if videos:
            for xx in videos:
                xx.thumbnail_web_path = xx.video_file.thumbnail_web_path
                xx.name = xx.video_file.name
                xx.model_kind = 'keepsake_video'
                xx.video_file.info = json.loads(xx.video_file.snowstream_info_json)

        return {
            'directories': directories,
            'images': images,
            'videos': videos
        }