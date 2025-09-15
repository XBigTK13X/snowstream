from database.operation.db_internal import dbi

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

def get_keepsake_by_directory(directory:str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Keepsake)
            .filter(dbi.dm.Keepsake.directory == directory)
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.video_files))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
            .first()
        )

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

def get_keepsake_list_by_directory(directory:str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Keepsake)
            .filter(dbi.dm.Keepsake.directory.contains(directory))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.video_files))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
            .order_by(
                dbi.func.length(dbi.dm.Keepsake.directory),
                dbi.dm.Keepsake.directory
            )
            .all()
        )

def get_keepsake_list_by_shelf(shelf_id: int, search_query:str=None):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Keepsake)
            .join(dbi.dm.KeepsakeShelf)
            .options(dbi.orm.joinedload(dbi.dm.Keepsake.shelf))
        )
        if search_query:
            query = query.filter(dbi.dm.Keepsake.directory.ilike(f'%{search_query}%'))
        query = (
            query.filter(dbi.dm.KeepsakeShelf.shelf_id == shelf_id)
            .order_by(
                dbi.func.length(dbi.dm.Keepsake.directory),
                dbi.dm.Keepsake.directory
            )
        )
        if search_query:
            query = query.limit(dbi.config.search_results_per_shelf_limit)
        return query.all()

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

