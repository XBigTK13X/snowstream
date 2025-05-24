from log import log
from db import db
import api_models as am

import message.handler.update_media.movie_shelf as update_movie_shelf
import message.handler.update_media.movie as update_movie
import message.handler.update_media.show_shelf as update_show_shelf
import message.handler.update_media.show as update_show
import message.handler.update_media.show_season as update_season
import message.handler.update_media.show_episode as update_episode


# TODO Use a similar scope limiter on the scan files jobs
def handle(job_id, scope):
    log.info(f"[WORKER] Handling an update_media_files job")

    if scope.is_unscoped():
        log.info("update_media_files must be scoped when run")
        return False

    handler = None
    if scope.is_shelf():
        log.info(f"Not yet implemented - Updating media for shelf {scope.target_id}")
        # TODO This may need to be a bit different
        # Loop through the entries on the shelf
        # If image/meta missing, then make a query and fill in
    elif scope.is_movie():
        handler = update_movie.Movie(scope=scope)
    elif scope.is_show():
        handler = update_show.Show(scope=scope)
    elif scope.is_season():
        handler = update_season.ShowSeason(scope=scope)
    elif scope.is_episode():
        handler = update_episode.ShowEpisode(scope=scope)
    else:
        log.info(f"Unhandled target of kind {scope.target}")
        return False

    if handler == None:
        return False

    handler.read_local_info()

    handler.read_remote_info()

    if scope.update_metadata:
        handler.merge_remote_into_local()
        handler.save_info_to_local()

    if scope.update_images:
        handler.download_images()

    handler.schedule_subjobs(update_images=scope.update_images,update_metadata=scope.update_metadata)

    return True
