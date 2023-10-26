from log import log
from db import db

import message.handler.scan_shelf.movies_scan as sm
import message.handler.scan_shelf.shows_scan as ss

shelf_handlers = {
    'Movies': sm.MoviesScanHandler,
    'Shows': ss.ShowsScanHandler
}


def handle(job_id, message_payload):
    log.info(f'[WORKER] Handling a scan_shelves_content job')
    shelves = db.op.get_shelf_list()
    results = {

    }
    for shelf in shelves:
        # TODO Unit tests for file name parsing
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
        results[shelf.name] = True

    log.info("Finished scan_shelves_content job")
    for key, val in results.items():
        if not val:
            return False
    return True
