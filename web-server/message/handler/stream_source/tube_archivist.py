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
        if super().download():
            return True

        videos_url = f"{self.stream_source.url}/api/video/?sort=published&order=desc"
        # TODO This only gets the last 100 videos, handle pagination
        archivist_response = requests.get(
            videos_url, headers={
                "User-Agent": "Snowstream 1.0.0",
                "Authorization": f'Token {self.stream_source.password}'
            }
        )

        info = archivist_response.json()

        if 'paginate' in info:
            if info['paginate']['last_page'] > 0:
                for ii in range(1,info['paginate']['last_page']+1):
                    page_url = f'{videos_url}&page={ii}'
                    page_response = requests.get(
                        page_url, headers={
                            "User-Agent": "Snowstream 1.0.0",
                            "Authorization": f'Token {self.stream_source.password}'
                        }
                    )
                    page_info = page_response.json()
                    info['data'] += page_info['data']

        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=json.dumps(info)
        )
        return True

    def parse_watchable_urls(self):
        ta_videos = json.loads(self.cached_data)
        ta_videos = ta_videos['data']
        dedupe = {}
        for xx in self.stream_source.streamables:
            dedupe[xx.url] = True
        new_count = 0
        for entry in ta_videos:
            web_path = entry['media_url']
            web_path = web_path.replace('/youtube',self.stream_source.username)
            if web_path in dedupe:
                continue
            title = entry['title']
            group = entry['channel']['channel_name']
            db.op.create_streamable(
                stream_source_id=self.stream_source.id,
                url=web_path,
                name=title,
                group=group
            )
            new_count += 1
            dedupe[web_path] = True
        if new_count > 0:
            db.op.update_job(job_id=self.job_id, message=f"Found {new_count} new streams")
        return True
