from log import log
from db import db
import api_models as am
import os
from message.job_media_scope import JobMediaScope

def handle(scope:JobMediaScope):
    db.op.update_job(job_id=scope.job_id,message=f"[WORKER] Handling a delete_media_records job")

    ticket = db.Ticket(ignore_watch_group=True)

    if not scope or scope.is_unscoped():
        db.op.update_job(job_id=scope.job_id, message="delete_media_records must be scoped when run")
        return False

    if scope.is_shelf():
        db.op.update_job(job_id=scope.job_id, message="delete_media_records cannot delete an entire shelf")
        return False

    elif scope.is_movie():
        db.op.delete_movie_records(ticket=ticket,movie_id=scope.target_id)

    elif scope.is_show():
        db.op.delete_show_records(ticket=ticket,show_id=scope.target_id)

    elif scope.is_season():
        db.op.delete_show_season_records(ticket=ticket,show_season_id=scope.target_id)

    elif scope.is_episode():
        db.op.delete_show_episode_records(ticket=ticket,show_episode_id=scope.target_id)

    else:
        db.op.update_job(job_id=scope.job_id, message="There is nothing for the job to do")

    return True