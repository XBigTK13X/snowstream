from message.handler.stream_source.stream_source_importer import StreamSourceImporter
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


class HdHomeRun(StreamSourceImporter):
    def __init__(self, job_id, stream_source):
        super().__init__(job_id, "HDHomeRun", stream_source)

    def download(self):
        if super().download():
            return True

        config_url = f"{self.stream_source.url}/lineup.json"
        hdhomerun_response = requests.get(
            config_url, headers={"User-Agent": "Snowstream 1.0.0"}
        )
        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=hdhomerun_response.text
        )
        return True

    def parse_watchable_urls(self):
        hhr_lineup = json.loads(self.cached_data)
        streams = []
        for entry in hhr_lineup:
            streams.append({"url": entry["URL"], "name": f'{entry["GuideName"]} - {entry["GuideNumber"]}'})
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
            db.op.update_job(job_id=self.job_id, message=f"Found {new_count} new streams")
        return True
