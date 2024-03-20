import message.handler.stream_source.base_handler as base
import requests
from db import db
import json
from log import log

# Docs
# https://info.hdhomerun.com/info/http_api

# Important endpoints
# http://hdhomerun.local/lineup.json
# http://hdhomerun.local/lineup.xml
# http://hdhomerun.local/lineup.m3u


class HdHomeRun(base.BaseHandler):
    def __init__(self, stream_source):
        super().__init__("HDHomeRun", stream_source)

    def download(self):
        if super().download():
            return True

        config_url = f"{self.stream_source.url}/lineup.json"
        hdhomerun_response = requests.get(
            config_url, headers={"User-Agent": "Snowstream 1.0.0"}
        )
        self.cached_data = db.op.create_cached_text(
            key=self.cache_key, data=hdhomerun_response.text
        )
        return True

    def parse_watchable_urls(self):
        hhr_lineup = json.loads(self.cached_data)
        streams = []
        for entry in hhr_lineup:
            streams.append({"url": entry["URL"], "name": entry["GuideName"]})
        new_count = 0
        for stream in streams:
            if not any(x.url == stream["url"] for x in self.stream_source.streamables):
                db.op.create_streamable(
                    stream_source_id=self.stream_source.id,
                    url=stream["url"],
                    name=stream["name"],
                )
                new_count += 1
        if new_count > 0:
            log.info(f"Found {new_count} new streams")
        return True
