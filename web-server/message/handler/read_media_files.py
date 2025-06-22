from log import log
from db import db
import api_models as am
import nfo

def prep(metadata_files,movie=None,show=None,show_season=None,show_episode=None):
    for mf in metadata_files:
        mf.movie = movie
        mf.show = show
        mf.show_season = show_season
        mf.show_episode = show_episode
    return metadata_files

def handle(scope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling a read_media_files job")
    metadata_files = None
    ticket = db.model.Ticket(ignore_watch_group=True)
    if scope.is_unscoped():
        metadata_files = db.op.get_metadata_file_list()
    elif scope.is_shelf():
        metadata_files = db.op.get_metadata_files_by_shelf(shelf_id=scope.target_id)
    elif scope.is_movie():
        movie = db.op.get_movie_by_id(ticket=ticket,movie_id=scope.target_id)
        metadata_files = prep(movie.metadata_files, movie=movie)
    elif scope.is_show():
        show = db.op.get_show_by_id(ticket=ticket,show_id=scope.target_id)
        metadata_files = prep(show.metadata_files,show=show)
        seasons = db.op.get_show_season_list_by_show_id(ticket=ticket,show_id=scope.target_id)
        for season in seasons:
            metadata_files += prep(season.metadata_files,show_season=season)
        episodes = db.op.get_show_episode_list(ticket=ticket,shelf_id=show.shelf.id,show_id=scope.target_id)
        for episode in episodes:
            metadata_files = list(metadata_files) + prep(episode.metadata_files,show_episode=episode)
    elif scope.is_season():
        season = db.op.get_show_season_by_id(ticket=ticket,season_id=scope.target_id)
        metadata_files = prep(season.metadata_files,season=season)
        episodes = db.op.get_show_episode_list(ticket=ticket,shelf_id=season.show.shelf.id,show_season_id=scope.target_id)
        for episode in episodes:
            metadata_files = list(metadata_files) + prep(episode.metadata_files,show_episode=episode)
    elif scope.is_episode():
        episode = db.op.get_show_episode_by_id(ticket=ticket,episode_id=scope.target_id)
        metadata_files = prep(episode.metadata_files,show_episode=episode)

    defined_tag_ids = {}
    progress_count = 0
    for metadata_file in metadata_files:
        progress_count += 1
        if progress_count % 500 == 0:
            db.op.update_job(job_id=scope.job_id, message=f'Read metadata file {progress_count} out of {len(metadata_files)}')
        if not metadata_file.local_path:
            continue
        nfo_content = nfo.nfo_path_to_dict(nfo_path=metadata_file.local_path)
        if not 'tag' in nfo_content:
            continue
        for tag_name in nfo_content['tag']:
            if not ':' in tag_name or 'Source:' in tag_name:
                continue
            if not tag_name in defined_tag_ids:
                tag = db.op.get_tag_by_name(tag_name)
                if tag == None:
                    tag = am.Tag(**{'name':tag_name})
                    tag = db.op.upsert_tag(tag)
                defined_tag_ids[tag_name] = tag.id
                db.op.update_job(job_id=scope.job_id, message=f"Processed [{tag.name}] for the first time on {metadata_file.local_path}")
            tag_id = defined_tag_ids[tag_name]
            if metadata_file.movie != None:
                db.op.upsert_movie_tag(metadata_file.movie.id,tag_id)
            if metadata_file.show != None:
                db.op.upsert_show_tag(metadata_file.show.id,tag_id)
            if metadata_file.show_season != None:
                db.op.upsert_show_season_tag(metadata_file.show_season.id,tag_id)
            if metadata_file.show_episode != None:
                db.op.upsert_show_episode_tag(metadata_file.show_episode.id,tag_id)

    return True
