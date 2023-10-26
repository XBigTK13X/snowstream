from log import log
import message.handler.scan_shelf.base_handler as base


class MoviesScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(job_id=job_id, shelf=shelf)

    def ingest_videos(self):
        for video_path in self.file_lookup['video']:
            log.info(f"Found a movie video [{video_path}]")
        return True

    def ingest_images(self):
        for image_path in self.file_lookup['image']:
            log.info(f"Found a movie image [{image_path}]")
        return True

    def ingest_metadata(self):
        for metadata_path in self.file_lookup['metadata']:
            log.info(f"Found some movie metadata [{metadata_path}]")
        return True
