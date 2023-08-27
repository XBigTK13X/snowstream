import requests
import db_op
import json
from log import log


class BaseHandler:
    def __init__(self, kind, stream_source):
        self.kind = kind
        self.stream_source = stream_source
        self.cache_key = f'stream-source-{self.stream_source.id}-{self.stream_source.kind}'
        self.cached_data = None

    def download(self):
        log.info(f"{self.kind} stream source updating")
        self.cached_data = db_op.get_cached_text_by_key(key=self.cache_key)
        if self.cached_data:
            self.cached_data = self.cached_data.data
            log.info(f"Using cached data from previous {self.kind} download")
            log.info(self.cached_data)
            return True
        log.info(f"Remote data not cached. Get the latest from {self.kind} data provider.")
        return False

    def parse_watchable_urls(self):
        return True

    def parse_guide_info(self):
        return True
