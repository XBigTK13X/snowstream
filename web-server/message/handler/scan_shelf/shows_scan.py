import message.handler.scan_shelf.base_handler as base
from log import log


class ShowsScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(job_id=job_id, shelf=shelf)

    def ingest_videos(self):
        for video_path in self.file_lookup['video']:
            log.info(f"Found a show video [{video_path}]")
        return True

    def ingest_images(self):
        for image_path in self.file_lookup['image']:
            log.info(f"Found a show image [{image_path}]")
        return True

    def ingest_metadata(self):
        for metadata_path in self.file_lookup['metadata']:
            log.info(f"Found some show metadata [{metadata_path}]")
        return True
