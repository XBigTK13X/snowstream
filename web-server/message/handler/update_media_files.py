from log import log

import message.handler.update_media.movie as update_movie
import message.handler.update_media.show as update_show
import message.handler.update_media.show_season as update_season
import message.handler.update_media.show_episode as update_episode


def handle(job_id, scope):
    log.info(f"[WORKER] Handling an update_media_files job")

    if not scope or scope.is_unscoped():
        log.info("update_media_files must be scoped when run")
        return False

    if not scope.metadata_id:
        log.info("update_media_files must be scoped with a metadata_id")
        return False

    if not scope.update_metadata and not scope.update_images:
        log.info("update_media_files requires either update_images or update_metadata")
        return False

    handler = None
    if scope.is_shelf():
        log.info(f"Updating the media of an entire shelf is not supported. Run an identify job instead")
        return False
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

    handler.read_local_info()

    handler.read_remote_info()

    if scope.update_metadata:
        handler.merge_remote_into_local()
        handler.save_info_to_local()

    if scope.update_images:
        handler.download_images()

    handler.schedule_subjobs(update_images=scope.update_images,update_metadata=scope.update_metadata)

    return True
