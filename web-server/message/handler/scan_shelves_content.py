from log import log
from db import db

import message.handler.scan_shelf.movies_scan as sm
import message.handler.scan_shelf.shows_scan as ss

shelf_handlers = {"Movies": sm.MoviesScanHandler, "Shows": ss.ShowsScanHandler}

from message.handler.job_media_scope import JobMediaScope

def handle(job_id, scope):
    log.info(f"[WORKER] Handling a scan_shelves_content job")

    shelves = db.op.get_shelf_list()
    results = {}
    handlers = []
    file_kinds = ['metadata','video','image']
    shelf_files = {}
    for kind in file_kinds:
        shelf_files[kind] = []
    for shelf in shelves:
        log.info(f"Scanning content for shelf [{shelf.name}->{shelf.kind}]")
        handler = shelf_handlers[shelf.kind](job_id=job_id, shelf=shelf)

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
        shelf_files['metadata'] += handler.get_files_lookup()['metadata']
        shelf_files['image'] += handler.get_files_lookup()['image']
        shelf_files['video'] += handler.get_files_lookup()['video']
        handlers.append(handler)
        results[shelf.name] = True

    log.info("Checking if all scan_shelves_content job tasks were successful")
    for key, val in results.items():
        if not val:
            return False

    log.info("File imports successful. Building the library.")
    for handler in handlers:
        log.info(
            f"Organizing [{handler.shelf.name} -> {handler.shelf.kind}] files into the library"
        )
        handler.organize_metadata()
        handler.organize_images()
        handler.organize_videos()

    log.info("Purging file records from the database if a file no longer exists on disk.")
    log.info(f'Purged {db.op.purge_missing_video_file_records(shelf_files["video"])} video files')
    log.info(f'Purged {db.op.purge_missing_image_file_records(shelf_files["image"])} image files')
    log.info(f'Purged {db.op.purge_missing_metadata_file_records(shelf_files["metadata"])} metadata files')

    return True
