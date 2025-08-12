from database.operation.db_internal import dbi
import database.operation.show_episode as db_episode

def create_show(name: str, directory: str):
    with dbi.session() as db:
        dbm = dbi.dm.Show()
        dbm.name = name
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_show_release_year(show_id:int, release_year:int):
    with dbi.session() as db:
        show = db.query(dbi.dm.Show).filter(dbi.dm.Show.id == show_id).first()
        show.release_year = release_year
        db.commit()
        return show

def update_show_remote_metadata_id(show_id:int, remote_metadata_id:int, remote_metadata_source:str='thetvdb'):
    with dbi.session() as db:
        show = db.query(dbi.dm.Show).filter(dbi.dm.Show.id == show_id).first()
        show.remote_metadata_id = remote_metadata_id
        show.remote_metadata_source = remote_metadata_source
        db.commit()
        return show

def get_show_by_name(name: str):
    with dbi.session() as db:
        return db.query(dbi.dm.Show).filter(dbi.dm.Show.name == name).first()

def get_show_by_id(ticket:dbi.dm.Ticket,show_id: int):
    with dbi.session() as db:
        show = (
            db.query(dbi.dm.Show)
            .filter(dbi.dm.Show.id == show_id)
            .options(dbi.orm.joinedload(dbi.dm.Show.shelf))
            .options(dbi.orm.joinedload(dbi.dm.Show.seasons))
            .options(dbi.orm.joinedload(dbi.dm.Show.metadata_files))
            .first()
        )
        if not ticket.is_allowed(shelf_id=show.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=show.get_tag_ids):
            return None
        show = dbi.dm.set_primary_images(show)
        return show

def get_show_by_directory(directory:str):
    with dbi.session() as db:
        return db.query(dbi.dm.Show).filter(dbi.dm.Show.directory == directory).first()

def add_show_to_shelf(show_id: int, shelf_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowShelf()
        dbm.shelf_id = shelf_id
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_list_by_tag_id(ticket:dbi.dm.Ticket, tag_id:int):
    with dbi.session() as db:
        shows = (
            db.query(dbi.dm.Show)
            .options(dbi.orm.joinedload(dbi.dm.Show.shelf))
            .options(dbi.orm.joinedload(dbi.dm.Show.tags))
            .options(dbi.orm.joinedload(dbi.dm.Show.metadata_files))
            .all()
        )
        results = []
        for show in shows:
            if not ticket.is_allowed(tag_provider=show.get_tag_ids):
                continue
            if tag_id in show.get_tag_ids():
                show = dbi.dm.set_primary_images(show)
                results.append(show)
        return results

def get_show_list_by_shelf(
    ticket:dbi.dm.Ticket,
    shelf_id: int,
    search_query:str=None,
    show_playlisted:bool=True
):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return None
    shelf_episodes = db_episode.get_show_episode_list(
        ticket=ticket,
        shelf_id=shelf_id,
        load_episode_files=False,
        trim_episode_files=True,
        first_per_show=True,
        only_unwatched=True
    )
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Show)
            .join(dbi.dm.ShowShelf)
            .filter(dbi.dm.ShowShelf.shelf_id == shelf_id)
            .options(dbi.orm.joinedload(dbi.dm.Show.shelf))
            .options(dbi.orm.joinedload(dbi.dm.Show.seasons))
        )
        if search_query:
            query = query.filter(dbi.dm.Show.name.ilike(f'%{search_query}%'))
        query = query.options(dbi.orm.joinedload(dbi.dm.Show.tags))
        query = (
            query
            .options(dbi.orm.joinedload(dbi.dm.Show.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Show.metadata_files))
            .order_by(dbi.dm.Show.name)
        )
        if search_query:
            query = query.limit(dbi.config.search_results_per_shelf_limit)
        shows = query.all()

        show_unwatched = {}
        for episode in shelf_episodes:
            show_unwatched[episode.season.show.id] = True

        results = []
        for show in shows:
            if not show.seasons:
                continue
            if not ticket.is_allowed(tag_provider=show.get_tag_ids):
                continue
            if show_playlisted == False and any('Playlist:' in xx.name for xx in show.tags):
                continue
            show = dbi.dm.set_primary_images(show)
            show.watched = not show.id in show_unwatched
            del show.image_files
            del show.metadata_files
            del show.seasons
            del show.created_at
            del show.updated_at
            del show.tags
            del show.screencap_image
            del show.directory
            del show.release_year
            results.append(show)
        return results

def create_show_image_file(show_id: int, image_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowImageFile()
        dbm.show_id = show_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_image_file(show_id: int, image_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowImageFile)
            .filter(dbi.dm.ShowImageFile.show_id == show_id)
            .filter(dbi.dm.ShowImageFile.image_file_id == image_file_id)
            .first()
        )

def create_show_metadata_file(show_id: int, metadata_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowMetadataFile()
        dbm.show_id = show_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_metadata_file(show_id: int, metadata_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowMetadataFile)
            .filter(dbi.dm.ShowMetadataFile.show_id == show_id)
            .filter(dbi.dm.ShowMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_tag(show_id: int, tag_id: int):
    with dbi.session() as db:
        existing = (
            db.query(dbi.dm.ShowTag)
            .filter(
                dbi.dm.ShowTag.show_id == show_id,
                dbi.dm.ShowTag.tag_id == tag_id
            ).first()
        )
        if existing:
            return existing
        dbm = dbi.dm.ShowTag()
        dbm.show_id = show_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_show_shelf_watched(ticket:dbi.dm.Ticket,shelf_id:int,is_watched:bool=True):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,shelf_id=shelf_id,load_episode_files=False,include_specials=True)
    episode_ids = [xx.id for xx in episodes]
    with dbi.session() as db:
        db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return False

def get_show_shelf_watched(ticket:dbi.dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,shelf_id=shelf_id,load_episode_files=False,include_specials=True)
    return all(xx.watched for xx in episodes)

def set_show_watched(ticket:dbi.dm.Ticket,show_id:int,is_watched:bool=True):
    show_episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id,include_specials=True)
    episode_ids = [xx.id for xx in show_episodes]
    if not show_episodes:
        return False
    with dbi.session() as db:
        db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return is_watched

def get_show_watched(ticket:dbi.dm.Ticket,show_id:int):
    show_episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id,load_episode_files=False,include_specials=True)
    if not show_episodes:
        return False
    return all(xx.watched for xx in show_episodes)

def get_unknown_show_list(shelf_id:int=None):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Show)
            .options(dbi.orm.joinedload(dbi.dm.Show.image_files))
            .options(dbi.orm.joinedload(dbi.dm.Show.metadata_files))
        )
        if shelf_id:
            query = query.join(dbi.dm.ShowShelf).filter(dbi.dm.ShowShelf.shelf_id == shelf_id)
        query = query.filter(dbi.dm.Show.remote_metadata_id == None)
        shows = query.all()
        results = []
        for show in shows:
            if not show.image_files or not show.metadata_files:
                episodes = db_episode.get_show_episode_list(
                    ticket=dbi.dm.Ticket(),
                    show_id=show.id,
                    include_specials=True,
                    load_episode_files=True,
                    first_per_show=True
                )
                if episodes and episodes[0].video_files:
                    results.append(show)
        return results

def delete_show_records(ticket:dbi.dm.Ticket, show_id:int):
    if not show_id:
        return False
    with dbi.session() as db:
        db.execute(dbi.sql_text(f'delete from show where show.id = {show_id};'))
        db.commit()
        return True