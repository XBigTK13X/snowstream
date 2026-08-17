import os
import json
import uuid
from settings import config
from db import db
from snow_media import image


def prep(files, movie=None, show=None, show_season=None, show_episode=None):
    results = []
    for ff in files:
        result = db.Stub()
        result.id = ff.id
        result.local_path = ff.local_path
        result.movie = None
        result.show = None
        result.show_season = None
        result.show_episode = None
        if ff.model_kind == "video_file":
            result.snowstream_info_json = ff.snowstream_info_json
            result.ffprobe_raw_json = ff.ffprobe_raw_json
            result.mediainfo_raw_json = ff.mediainfo_raw_json
        if movie:
            result.movie = db.Stub()
            result.movie.id = movie.id
            result.movie.release_year = movie.release_year
            result.movie.name = movie.name
        if show:
            result.show = db.Stub()
            result.show.id = show.id
            result.show.release_year = show.release_year
            result.show.name = show.name
        if show_season:
            result.show_season = db.Stub()
            result.show_season.id = show_season.id
        if show_episode:
            result.show_episode = db.Stub()
            result.show_episode.id = show_episode.id
        results.append(result)
    return results


def handle(scope):
    db.op.update_job(
        job_id=scope.job_id,
        message=f"[WORKER] Handling a regen_screencap_thumbnails job",
    )
    video_files = None
    ticket = db.Ticket(ignore_watch_group=True)

    if scope.is_unscoped():
        db.op.update_job(
            job_id=scope.job_id, message="Getting all entries from the database"
        )
        video_files = db.op.get_video_file_list()
    elif scope.is_directory():
        video_files = db.op.get_video_file_list(directory=scope.target_directory)
    elif scope.is_shelf():
        video_files = db.op.get_video_files_by_shelf(shelf_id=scope.target_id)
    elif scope.is_movie():
        movie = db.op.get_movie_by_id(ticket=ticket, movie_id=scope.target_id)
        video_files = prep(files=movie.video_files, movie=movie)
    elif scope.is_show():
        show = db.op.get_show_by_id(ticket=ticket, show_id=scope.target_id)
        episodes = db.op.get_show_episode_list(
            ticket=ticket,
            shelf_id=show.shelf.id,
            show_id=scope.target_id,
            load_episode_files=True,
            include_specials=True,
        )
        video_files = []
        for episode in episodes:
            video_files += prep(files=episode.video_files, show_episode=episode)
    elif scope.is_season():
        season = db.op.get_show_season_by_id(ticket=ticket, season_id=scope.target_id)
        episodes = db.op.get_show_episode_list(
            ticket=ticket,
            shelf_id=season.show.shelf.id,
            show_season_id=scope.target_id,
            load_episode_files=True,
            include_specials=True,
        )
        video_files = []
        for episode in episodes:
            video_files += prep(files=episode.video_files, show_episode=episode)
    elif scope.is_episode():
        episode = db.op.get_show_episode_by_id(
            ticket=ticket, episode_id=scope.target_id
        )
        video_files = prep(files=episode.video_files, show_episode=episode)

    if video_files:
        db.op.update_job(
            job_id=scope.job_id, message=f"Updating {len(video_files)} video files"
        )
        progress_count = 0
        for video_file in video_files:
            progress_count += 1
            if progress_count % 500 == 0:
                db.op.update_job(
                    job_id=scope.job_id,
                    message=f"Read video file {progress_count} out of {len(video_files)}",
                )
            if not video_file.local_path:
                continue
            if not os.path.exists(video_file.local_path):
                db.op.update_job(
                    job_id=scope.job_id,
                    message=f"WARNING A video_file db entry exists for a path that does not exist\n\t({video_file.id})[{video_file.local_path}]",
                )
                continue
            if video_file.thumbnail_web_path and scope.skip_existing:
                continue

            tmp_path = os.path.join("/tmp", str(uuid.uuid4()) + ".jpg")
            try:
                info = json.loads(video_file.snowstream_info_json)
                image.extract_screencap(
                    video_path=video_file.local_path,
                    duration_seconds=info["duration_seconds"],
                    output_path=tmp_path,
                )
                thumbnail_path = image.create_thumbnail(local_path=tmp_path)

                thumbnail_web_path = config.web_media_url + thumbnail_path
                if thumbnail_path[0] != "/":
                    thumbnail_web_path = config.web_media_url + "/" + thumbnail_path
                db.op.update_video_file_thumbnail(
                    video_file_id=video_file.id,
                    thumbnail_web_path=thumbnail_web_path,
                )
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

    return True
