from log import log
from db import db
import snow_media.video

from message.job_media_scope import JobMediaScope

def handle(scope:JobMediaScope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling a sanitize_file_properties job")

    if scope.is_unscoped() or scope.is_shelf():
        db.op.update_job(job_id=scope.job_id, status="failed", message=f"sanitize job must be scopef tighter than shelf")
        return False

    ticket = db.Ticket(ignore_watch_group=True)

    video_files = []
    if scope.is_directory():
        video_files = db.op.get_video_file_list(directory=scope.target_directory)
    elif scope.is_movie():
        movie = db.op.get_movie_by_id(ticket=ticket,movie_id=scope.target_id)
        video_files = movie.video_files
    elif scope.is_show():
        show = db.op.get_show_by_id(ticket=ticket,show_id=scope.target_id)
        episodes = db.op.get_show_episode_list(ticket=ticket,shelf_id=show.shelf.id,show_id=scope.target_id,load_episode_files=True,include_specials=True)
        for episode in episodes:
            video_files += episode.video_files
    elif scope.is_season():
        season = db.op.get_show_season_by_id(ticket=ticket,season_id=scope.target_id)
        episodes = db.op.get_show_episode_list(ticket=ticket,shelf_id=season.show.shelf.id,show_season_id=scope.target_id,load_episode_files=True,include_specials=True)
        for episode in episodes:
            video_files += episode.video_files
    elif scope.is_episode():
        episode = db.op.get_show_episode_by_id(ticket=ticket,episode_id=scope.target_id)
        video_files = episode.video_files


    db.op.update_job(job_id=scope.job_id, message=f"Sanitizing {len(video_files)} videos")
    for video_file in video_files:
        snow_media.video.scrub_container_info(local_path=video_file.local_path)

    return True
