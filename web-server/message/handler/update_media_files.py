from log import log
from db import db

import message.handler.update_media.movie as update_movie
import message.handler.update_media.show as update_show
import message.handler.update_media.show_season as update_season
import message.handler.update_media.show_episode as update_episode


def handle(scope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling an update_media_files job")

    if not scope or scope.is_unscoped():
        db.op.update_job(job_id=scope.job_id, message="update_media_files must be scoped when run")
        return False

    if not scope.metadata_id and not scope.extract_only:
        db.op.update_job(job_id=scope.job_id, message="update_media_files must be scoped with a metadata_id or be limited to extract_only")
        return False

    if not scope.update_metadata and not scope.update_images:
        db.op.update_job(job_id=scope.job_id, message="update_media_files requires either update_images or update_metadata")
        return False

    handler = None
    if scope.is_shelf():
        db.op.update_job(job_id=scope.job_id, message=f"Updating the media of an entire shelf is not supported. Run an identify job instead")
        return False
    elif scope.is_movie():
        handler = update_movie.Movie(job_id=scope.job_id,scope=scope)
    elif scope.is_show():
        handler = update_show.Show(job_id=scope.job_id,scope=scope)
    elif scope.is_season():
        handler = update_season.ShowSeason(job_id=scope.job_id,scope=scope)
    elif scope.is_episode():
        handler = update_episode.ShowEpisode(job_id=scope.job_id,scope=scope)
    else:
        db.op.update_job(job_id=scope.job_id, message=f"Unhandled target of kind {scope.target_kind}")
        return False

    if scope.update_metadata:
        if handler.has_nfo() and scope.skip_existing_media():
            db.op.update_job(job_id=scope.job_id, message=f"Not overwriting existing metadata")
        else:
            if not scope.extract_only:
                handler.read_remote_info()
                handler.read_local_info()
                handler.merge_remote_into_local()
            handler.save_info_to_local()

    if scope.update_images:
        if handler.has_images() and scope.skip_existing_media():
            db.op.update_job(job_id=scope.job_id, message=f"Not overwriting existing images")
        else:
            handler.download_images()

    handler.schedule_subjobs()

    return True