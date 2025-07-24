from message.handler.stream_source.stream_source_importer import StreamSourceImporter
import requests
from db import db
import json
from log import log

# Docs
# https://docs.tubearchivist.com/api/introduction/
# https://youtube.9914.us/api/docs/

class TubeArchivist(StreamSourceImporter):
    def __init__(self, job_id, stream_source):
        super().__init__(job_id, "TubeArchivist", stream_source)

    def download(self):
        # if super().download():
        #   return True

        config_url = f"{self.stream_source.url}/api/video/?sort=published&order=desc"
        # TODO This only gets the last 100 videos, handle pagination
        archivist_response = requests.get(
            config_url, headers={
                "User-Agent": "Snowstream 1.0.0",
                "Authorization": f'Token {self.stream_source.password}'
            }
        )

        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=json.dumps(archivist_response.json())
        )
        return True

    def parse_watchable_urls(self):
        ta_videos = json.loads(self.cached_data)
        ta_videos = ta_videos['data']
        streams = []
        for entry in ta_videos:
            web_path = entry['media_url']
            web_path = web_path.replace('/youtube',self.stream_source.username)
            title = f"{entry['channel']['channel_name']} - {entry['title']}"
            streams.append({"url": web_path, "name": title})
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
