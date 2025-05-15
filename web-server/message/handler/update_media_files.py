from log import log
from db import db
import api_models as am

import message.handler.update_media.movie_shelf as update_movie_shelf
import message.handler.update_media.movie as update_movie
import message.handler.update_media.show_shelf as update_show_shelf
import message.handler.update_media.show as update_show
import message.handler.update_media.show_season as update_season
import message.handler.update_media.show_episode as update_episode

# TODO Optionally allow the job to limit the scope to 1 shelf/show/season etc
def handle(job_id, message_payload):
    log.info(f"[WORKER] Handling an update_media_files job")
    job_input = message_payload['input']
    target = job_input['target_scope']
    target_id = job_input['target_id']
    metadata_id = job_input['metadata_id']
    season_order = job_input['season_order'] if 'season_order' in job_input else None
    episode_order = job_input['episode_order'] if 'episode_order' in job_input else None

    handler = None
    if target == 'shelf':
        log.info(f"Updating media for shelf {target_id}")
        # TODO This may need to be a bit different
        # Loop through the entries on the shelf
        # If image/meta missing, then make a query and fill in
    elif target == 'movie':
        log.info(f"Updating media for movie {target_id}")
        handler = update_movie.Movie(movie_id=target_id)
    elif target == 'show':
        log.info(f"Updating media for show {target_id}")
        handler = update_show.Show(show_id=target_id)
    elif target == 'season':
        log.info(f"Updating media for season {target_id}")
        handler = update_season.ShowSeason(show_season_id=target_id)
    elif target == 'episode':
        log.info(f"Updating media for episode {target_id}")
        handler = update_episode.ShowEpisode(show_episode_id=target_id)
    else:
        log.info(f"Unhandled target of kind {target}")
        return False

    if handler == None:
        return False

    handler.read_local_info()

    if episode_order:
        handler.read_remote_info(metadata_id=metadata_id,season_order=season_order,episode_order=episode_order)
    elif season_order:
        handler.read_remote_info(metadata_id=metadata_id,season_order=season_order)
    else:
        handler.read_remote_info(metadata_id=metadata_id)

    handler.merge_remote_into_local()

    handler.save_info_to_local()

    handler.download_images()

    handler.schedule_subjobs()

    return True
