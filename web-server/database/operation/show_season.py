from database.operation.db_internal import dbi
import database.operation.show_episode as db_episode

def create_show_season(show_id: int, season_order_counter: int, directory: str):
    with dbi.session() as db:
        dbm = dbi.dm.ShowSeason()
        dbm.season_order_counter = season_order_counter
        dbm.show_id = show_id
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_show_season_by_id(ticket:dbi.dm.Ticket,season_id:int):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.ShowSeason)
            .filter(dbi.dm.ShowSeason.id == season_id)
            .options(dbi.orm.joinedload(dbi.dm.ShowSeason.metadata_files))
        )
        if ticket.has_tag_restrictions():
            query = query.options(dbi.orm.joinedload(dbi.dm.ShowSeason.tags))
        show_season = query.first()
        if not show_season:
            return None
        if not ticket.is_allowed(shelf_id=show_season.show.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
            return None
        return show_season

def get_show_season_by_show_and_order(show_id: int, season_order_counter: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowSeason)
            .options(dbi.orm.joinedload(dbi.dm.ShowSeason.tags))
            .filter(dbi.dm.ShowSeason.show_id == show_id)
            .filter(dbi.dm.ShowSeason.season_order_counter == season_order_counter)
            .first()
        )

def get_show_season_list_by_shelf(ticket:dbi.dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return []
    with dbi.session() as db:
        query = db.query(dbi.dm.ShowSeason).filter(dbi.dm.ShowShelf == shelf_id)
        if ticket.has_tag_restrictions():
            query = query.options(dbi.orm.joinedload(dbi.dm.ShowSeason.tags))
        query = query.options(dbi.orm.joinedload(dbi.dm.ShowSeason.image_files))
        query = query.options(dbi.orm.joinedload(dbi.dm.ShowSeason.metadata_files))
        show_seasons = query.all()
        results = []
        for show_season in show_seasons:
            if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
                continue
            results.append(dbi.dm.set_primary_images(show_season))
        return results

def get_show_season_list_by_show_id(ticket:dbi.dm.Ticket,show_id: int):
    unwatched_episodes = db_episode.get_show_episode_list(
        ticket=ticket,
        show_id=show_id,
        load_episode_files=False,
        only_unwatched=True,
        first_per_season=True,
        include_specials=True
    )
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.ShowSeason)
            .filter(dbi.dm.ShowSeason.show_id == show_id)
            .options(
                dbi.orm.joinedload(dbi.dm.ShowSeason.show)
                .joinedload(dbi.dm.Show.shelf)
            )
            .options(dbi.orm.joinedload(dbi.dm.ShowSeason.image_files))
            .options(dbi.orm.joinedload(dbi.dm.ShowSeason.metadata_files))
        )
        show_seasons = query.order_by(dbi.dm.ShowSeason.season_order_counter).all()

        results = []
        season_unwatched = {}
        for episode in unwatched_episodes:
            season_unwatched[episode.season.id] = True
        for show_season in show_seasons:
            if not ticket.is_allowed(tag_provider=show_season.get_tag_ids):
                continue
            season = dbi.dm.set_primary_images(show_season)
            show = dbi.dm.set_primary_images(show_season.show)
            if not season.poster_image:
                season.poster_image = show.poster_image
                season.screencap_image = show.screencap_image
            season.name = dbi.util.get_season_title(season)
            season.watched = not season.id in season_unwatched
            results.append(season)
        return results

def create_show_season_image_file(show_season_id: int, image_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowSeasonImageFile()
        dbm.show_season_id = show_season_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_season_image_file(show_season_id: int, image_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowSeasonImageFile)
            .filter(dbi.dm.ShowSeasonImageFile.show_season_id == show_season_id)
            .filter(dbi.dm.ShowSeasonImageFile.image_file_id == image_file_id)
            .first()
        )

def create_show_season_metadata_file(show_season_id: int, metadata_file_id: int):
    with dbi.session() as db:
        dbm = dbi.dm.ShowSeasonMetadataFile()
        dbm.show_season_id = show_season_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_season_metadata_file(show_season_id: int, metadata_file_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ShowSeasonMetadataFile)
            .filter(dbi.dm.ShowSeasonMetadataFile.show_season_id == show_season_id)
            .filter(dbi.dm.ShowSeasonMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_season_tag(show_season_id: int, tag_id: int):
    with dbi.session() as db:
        existing = db.query(dbi.dm.ShowSeasonTag).filter(
            dbi.dm.ShowSeasonTag.show_season_id == show_season_id,
            dbi.dm.ShowSeasonTag.tag_id == tag_id
        ).first()
        if existing:
            return existing
        dbm = dbi.dm.ShowSeasonTag()
        dbm.show_season_id = show_season_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_show_season_watched(ticket:dbi.dm.Ticket,season_id:int,is_watched:bool=True):
    episodes = db_episode.get_show_episode_list(ticket=ticket,show_season_id=season_id,load_episode_files=False,include_specials=True)
    episode_ids = [xx.id for xx in episodes]
    with dbi.session() as db:
        db.query(dbi.dm.Watched).filter(
            dbi.dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dbi.dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return is_watched

def get_show_season_watched(ticket:dbi.dm.Ticket,season_id:int):
    season = get_show_season_by_id(ticket=ticket,season_id=season_id)
    if not season:
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,show_season_id=season_id,load_episode_files=False,include_specials=True)
    return all(xx.watched for xx in episodes)

def delete_show_season_records(ticket:dbi.dm.Ticket, show_season_id:int):
    if not show_season_id:
        return False
    with dbi.session() as db:
        db.execute(dbi.sql_text(f'delete from show_season where show_season.id = {show_season_id};'))
        db.commit()
        return True