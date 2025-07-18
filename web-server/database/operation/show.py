import database.db_models as dm
from database.sql_alchemy import DbSession
import sqlalchemy.orm as sorm
from settings import config
import database.operation.show_episode as db_episode
import database.operation.show_season as db_season

def create_show(name: str, directory: str):
    with DbSession() as db:
        dbm = dm.Show()
        dbm.name = name
        dbm.directory = directory
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_show_release_year(show_id:int, release_year:int):
    with DbSession() as db:
        show = db.query(dm.Show).filter(dm.Show.id == show_id).first()
        show.release_year = release_year
        db.commit()
        return show

def update_show_remote_metadata_id(show_id:int, remote_metadata_id:int, remote_metadata_source:str='thetvdb'):
    with DbSession() as db:
        show = db.query(dm.Show).filter(dm.Show.id == show_id).first()
        show.remote_metadata_id = remote_metadata_id
        show.remote_metadata_source = remote_metadata_source
        db.commit()
        return show

def get_show_by_name(name: str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.name == name).first()

def get_show_by_id(ticket:dm.Ticket,show_id: int):
    with DbSession() as db:
        show = (
            db.query(dm.Show)
            .filter(dm.Show.id == show_id)
            .options(sorm.joinedload(dm.Show.shelf))
            .options(sorm.joinedload(dm.Show.seasons))
            .options(sorm.joinedload(dm.Show.metadata_files))
            .first()
        )
        if not ticket.is_allowed(shelf_id=show.shelf.id):
            return None
        if not ticket.is_allowed(tag_provider=show.get_tag_ids):
            return None
        show = dm.set_primary_images(show)
        return show

def get_show_by_directory(directory:str):
    with DbSession() as db:
        return db.query(dm.Show).filter(dm.Show.directory == directory).first()

def add_show_to_shelf(show_id: int, shelf_id: int):
    with DbSession() as db:
        dbm = dm.ShowShelf()
        dbm.shelf_id = shelf_id
        dbm.show_id = show_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_list_by_tag_id(ticket:dm.Ticket, tag_id:int):
    if not ticket.is_allowed(tag_id=tag_id):
        return None
    with DbSession() as db:
        shows = (
            db.query(dm.Show)
            .options(sorm.joinedload(dm.Show.shelf))
            .options(sorm.joinedload(dm.Show.tags))
            .options(sorm.joinedload(dm.Show.metadata_files))
            .all()
        )
        results = []
        for show in shows:
            if tag_id in show.get_tag_ids():
                show = dm.set_primary_images(show)
                results.append(show)
        return results

def get_show_list_by_shelf(
    ticket:dm.Ticket,
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
    with DbSession() as db:
        query = (
            db.query(dm.Show)
            .join(dm.ShowShelf)
            .filter(dm.ShowShelf.shelf_id == shelf_id)
            .options(sorm.joinedload(dm.Show.shelf))
            .options(sorm.joinedload(dm.Show.seasons))
        )
        if search_query:
            query = query.filter(dm.Show.name.ilike(f'%{search_query}%'))
        query = query.options(sorm.joinedload(dm.Show.tags))
        query = (
            query
            .options(sorm.joinedload(dm.Show.image_files))
            .options(sorm.joinedload(dm.Show.metadata_files))
            .order_by(dm.Show.name)
        )
        if search_query:
            query = query.limit(config.search_results_per_shelf_limit)
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
            show = dm.set_primary_images(show)
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
    with DbSession() as db:
        dbm = dm.ShowImageFile()
        dbm.show_id = show_id
        dbm.image_file_id = image_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_image_file(show_id: int, image_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowImageFile)
            .filter(dm.ShowImageFile.show_id == show_id)
            .filter(dm.ShowImageFile.image_file_id == image_file_id)
            .first()
        )

def create_show_metadata_file(show_id: int, metadata_file_id: int):
    with DbSession() as db:
        dbm = dm.ShowMetadataFile()
        dbm.show_id = show_id
        dbm.metadata_file_id = metadata_file_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_show_metadata_file(show_id: int, metadata_file_id: int):
    with DbSession() as db:
        return (
            db.query(dm.ShowMetadataFile)
            .filter(dm.ShowMetadataFile.show_id == show_id)
            .filter(dm.ShowMetadataFile.metadata_file_id == metadata_file_id)
            .first()
        )

def upsert_show_tag(show_id: int, tag_id: int):
    with DbSession() as db:
        existing = db.query(dm.ShowTag).filter(dm.ShowTag.show_id == show_id and dm.ShowTag.tag_id == tag_id).first()
        if existing:
            return existing
        dbm = dm.ShowTag()
        dbm.show_id = show_id
        dbm.tag_id = tag_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def set_show_shelf_watched(ticket:dm.Ticket,shelf_id:int,is_watched:bool=True):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,shelf_id=shelf_id,load_episode_files=False)
    episode_ids = [xx.id for xx in episodes]
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return False

def get_show_shelf_watched(ticket:dm.Ticket,shelf_id:int):
    if not ticket.is_allowed(shelf_id=shelf_id):
        return False
    episodes = db_episode.get_show_episode_list(ticket=ticket,shelf_id=shelf_id,load_episode_files=False)
    return all(xx.watched for xx in episodes)

def set_show_watched(ticket:dm.Ticket,show_id:int,is_watched:bool=True):
    show_episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id)
    episode_ids = [xx.id for xx in show_episodes]
    if not show_episodes:
        return False
    with DbSession() as db:
        db.query(dm.Watched).filter(
            dm.Watched.client_device_user_id.in_(ticket.watch_group),
            dm.Watched.show_episode_id.in_(episode_ids)
        ).delete()
        db.commit()
        if is_watched:
            return db_episode.set_show_episode_list_watched(ticket=ticket,episode_ids=episode_ids)
    return is_watched

def get_show_watched(ticket:dm.Ticket,show_id:int):
    show_episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id,load_episode_files=False)
    if not show_episodes:
        return False
    return all(xx.watched for xx in show_episodes)

def get_unknown_show_list(shelf_id:int=None):
    with DbSession() as db:
        query = (
            db.query(dm.Show)
            .options(sorm.joinedload(dm.Show.image_files))
            .options(sorm.joinedload(dm.Show.metadata_files))
        )
        if shelf_id:
            query = query.join(dm.ShowShelf).filter(dm.ShowShelf.shelf_id == shelf_id)
        query = query.filter(dm.Show.remote_metadata_id == None)
        shows = query.all()
        results = []
        for show in shows:
            if not show.image_files or not show.metadata_files:
                results.append(show)
        return results

def delete_show_records(ticket:dm.Ticket, show_id:int):
    episodes = db_episode.get_show_episode_list(ticket=ticket,show_id=show_id,load_episode_files=True)
    seasons = db_season.get_show_season_list_by_show_id(ticket=ticket,show_id=show_id)
    with DbSession() as db:
        raw_query =f'''
        select

        {f'distinct on (show.name)' if first_per_show else ''}
        {f'distinct on (season.season_order_counter)' if first_per_season else ''}

        episode.id as episode_id,
        episode.name as episode_name,
        episode.episode_order_counter as episode_order,
        episode.episode_end_order_counter as episode_end_order,
        {"array_remove(array_agg(watched.id),NULL) as episode_watched_list," if watch_group else ""}
        {"array_remove(array_agg(watch_count.amount),NULL) as episode_watch_count_list," if watch_group else ""}
        {"array_remove(array_agg(watch_progress.played_seconds),NULL) as episode_in_progress_list," if watch_group else ""}

        season.id as season_id,
        season.season_order_counter as season_order,

        show.id as show_id,
        show.name as show_name,

        shelf.id as shelf_id,
        shelf.name as shelf_name,

        {"""
        array_remove(array_agg(episode_image.id),NULL) as image_id_list,
        array_remove(array_agg(episode_image.local_path),NULL) as image_local_path_list,
        array_remove(array_agg(episode_image.web_path),NULL) as image_web_path_list,
        array_remove(array_agg(episode_image.kind),NULL) as image_kind_list,
        array_remove(array_agg(episode_image.thumbnail_web_path),NULL) as image_thumbnail_web_path_list,

        array_agg(episode_video.id) as video_id_list,
        array_agg(episode_video.kind) as video_kind_list,
        array_agg(episode_video.local_path) as video_local_path_list,
        array_agg(episode_video.network_path) as video_network_path_list,
        array_agg(episode_video.snowstream_info_json) as video_info_list,
        array_agg(episode_video.ffprobe_raw_json) as video_ffprobe_list,
        array_agg(episode_video.mediainfo_raw_json) as video_mediainfo_list,
        array_agg(episode_video.version) as video_version_list,

        array_agg(episode_metadata.id) as metadata_id_list,
        array_agg(episode_metadata.kind) as metadata_kind_list,
        array_agg(episode_metadata.local_path) as metadata_local_path_list,
        array_agg(episode_metadata.xml_content) as metadata_xml_content_list,
        """ if load_episode_files else ''}

        array_remove(array_agg(show_image.id),NULL) as show_image_id_list,
        array_remove(array_agg(show_image.local_path),NULL) as show_image_local_path_list,
        array_remove(array_agg(show_image.web_path),NULL) as show_image_web_path_list,
        array_remove(array_agg(show_image.kind),NULL) as show_image_kind_list,
        array_remove(array_agg(show_image.thumbnail_web_path),NULL) as show_image_thumbnail_web_path_list,

        array_remove(array_agg(show_tag.name),NULL) as show_tag_name_list,
        array_remove(array_agg(show_tag.id),NULL) as show_tag_id_list,
        array_remove(array_agg(season_tag.name),NULL) as season_tag_name_list,
        array_remove(array_agg(season_tag.id),NULL) as season_tag_id_list,
        array_remove(array_agg(episode_tag.name),NULL) as episode_tag_name_list,
        array_remove(array_agg(episode_tag.id),NULL) as episode_tag_id_list

        from show as show
        join show_season as season on season.show_id = show.id
            and show.id = {show_id}
        join show_episode as episode on show_season.id = episode.show_season_id
        left join watched as watched on watched.show_episode_id = episode.id
        left join watch_progress as watch_progress on watch_progress.show_episode_id = episode.id

        left join show_episode_image_file as seif on seif.show_episode_id = episode.id
        left join image_file as episode_image on seif.image_file_id = episode_image.id
        left join show_episode_video_file as sevf on sevf.show_episode_id = episode.id
        left join video_file as episode_video on sevf.video_file_id = episode_video.id
        left join show_episode_metadata_file as semf on semf.show_episode_id = episode.id
        left join metadata_file as episode_metadata on semf.metadata_file_id = episode_metadata.id

        left join show_image_file as sif on sif.show_id = show.id
        left join image_file as show_image on sif.image_file_id = show_image.id

        left join show_tag as st on st.show_id = show.id
        left join tag as show_tag on show_tag.id = st.tag_id
        left join show_season_tag as sst on sst.show_season_id = season.id
        left join tag as season_tag on season_tag.id = sst.tag_id
        left join show_episode_tag as setag on setag.show_episode_id = episode.id
        left join tag as episode_tag on episode_tag.id = setag.tag_id
        left join watch_count as watch_count on watch_count.show_episode_id = episode.id

        where 1=1
        group by
            shelf.id,
            shelf.name,
            show.id,
            show.name,
            season.id,
            season.season_order_counter,
            episode.episode_order_counter,
            episode.episode_end_order_counter,
            episode.id,
            episode.name
        order by
            show.name,
            season.season_order_counter,
            episode.episode_order_counter
        '''
        cursor = db.execute(sql_text(raw_query))
        results = []
        raw_result_count = 0
        for xx in cursor:
            raw_result_count += 1
            model = sql_row_to_api_result(
                row=xx,
                load_episode_files=load_episode_files,
                trim_episode_files=trim_episode_files,
                watch_group=watch_group
            )
            if not model.has_images and not show_season_id:
                continue
            if not ticket.is_allowed(tag_ids=model.tag_ids):
                continue
            if show_playlisted == False and any('Playlist:' in xx for xx in model.tag_names):
                continue
            results.append(model)
        if first_result == True:
            return results[0]
        return results
    pass