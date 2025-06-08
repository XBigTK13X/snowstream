from db import db
from log import log


class StreamSourceImporter:
    def __init__(self, job_id, kind, stream_source):
        self.job_id = job_id
        self.kind = kind
        self.stream_source = stream_source
        self.cache_key = (
            f"stream-source-{self.stream_source.id}-{self.stream_source.kind}"
        )
        self.cached_data = None

    def download(self):
        db.op.update_job(job_id=self.job_id, message=f"{self.kind} stream source updating")
        self.cached_data = db.op.get_cached_text_by_key(key=self.cache_key)
        if self.cached_data:
            self.cached_data = self.cached_data
            db.op.update_job(job_id=self.job_id, message=f"Using cached data from previous {self.kind} download")
            return True
        db.op.update_job(job_id=self.job_id, message=
            f"Remote data not cached. Get the latest from {self.kind} data provider."
        )
        return False

    def parse_watchable_urls(self):
        return True

    def parse_guide_info(self):
        return True
