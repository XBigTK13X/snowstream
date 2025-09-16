from db import db
from log import log


class GuideSourceImporter:
    def __init__(self, job_id, kind, guide_source):
        self.job_id = job_id
        self.kind = kind
        self.guide_source = guide_source
        self.cache_key = (
            f"guide-source-{self.guide_source.id}-{self.guide_source.kind}"
        )
        self.cached_data = None

    def download(self):
        db.op.update_job(job_id=self.job_id, message=f"{self.kind} guide source updating")
        self.cached_data = db.op.get_cached_text_by_key(key=self.cache_key)
        if self.cached_data:
            self.cached_data = self.cached_data
            db.op.update_job(job_id=self.job_id, message=f"Using cached data from previous {self.kind} download")
            return True
        db.op.update_job(job_id=self.job_id, message=
            f"Remote data not cached. Get the latest from {self.kind} data provider."
        )
        return False

    def parse_guide_info(self):
        return True
