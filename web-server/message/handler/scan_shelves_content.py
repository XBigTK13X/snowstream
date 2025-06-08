from db import db

import message.handler.scan_shelf.movies_scan as sm
import message.handler.scan_shelf.shows_scan as ss

from message.handler.job_media_scope import JobMediaScope

shelf_handlers = {"Movies": sm.MoviesScanHandler, "Shows": ss.ShowsScanHandler}

def handle(scope:JobMediaScope):
    db.op.update_job(job_id=scope.job_id,message=f"[WORKER] Handling a scan_shelves_content job")

    shelves = []
    target_directory = None
    ticket = db.model.Ticket()
    if scope.is_unscoped():
        shelves = db.op.get_shelf_list()
    else:
        if scope.is_shelf():
            shelves = [db.op.get_shelf_by_id(shelf_id=scope.target_id)]
        elif scope.is_movie():
            movie = db.op.get_movie_by_id(ticket=ticket,movie_id=scope.target_id)
            target_directory = movie.directory
            shelves = [movie.shelf]
        elif scope.is_show():
            show = db.op.get_show_by_id(ticket=ticket, show_id=scope.target_id)
            target_directory = show.directory
            shelves = [show.shelf]
        elif scope.is_season():
            show_season = db.op.get_show_season_by_id(ticket=ticket, season_id=scope.target_id)
            target_directory = show_season.directory
            shelves = [show_season.show.shelf]
        elif scope.is_episode():
            show_episode = db.op.get_show_episode_by_id(ticket=ticket, episode_id=scope.target_id)
            target_directory = show_episode.season.directory
            shelves = [show_episode.season.show.shelf]

    if scope.target_directory:
        target_directory = scope.target_directory

    results = {}
    handlers = []
    for shelf in shelves:
        if target_directory and not shelf.local_path in target_directory:
            continue
        db.op.update_job(job_id=scope.job_id,message=f"Scanning content for shelf [{shelf.name}->{shelf.kind}]")
        handler = shelf_handlers[shelf.kind](job_id=scope.job_id, shelf=shelf, target_directory=target_directory)

        if not handler.get_files_in_directory():
            results[shelf.name] = False
            continue
        if not handler.ingest_videos():
            results[shelf.name] = False
            continue
        if not handler.ingest_images():
            results[shelf.name] = False
            continue
        if not handler.ingest_metadata():
            results[shelf.name] = False
            continue
        handlers.append(handler)
        results[shelf.name] = True

    db.op.update_job(job_id=scope.job_id,message="Checking if all scan_shelves_content job tasks were successful")
    for key, val in results.items():
        if not val:
            return False

    db.op.update_job(job_id=scope.job_id,message="Finished walking the files on disk for shelves. Add found files to database.")
    for handler in handlers:
        db.op.update_job(job_id=scope.job_id,message=f"Organizing [{handler.shelf.name} -> {handler.shelf.kind}] files into the library")
        handler.organize_metadata()
        handler.organize_images()
        handler.organize_videos()

    return True
