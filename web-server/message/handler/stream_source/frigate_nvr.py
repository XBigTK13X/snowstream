from message.handler.stream_source.stream_source_importer import StreamSourceImporter
import requests
from db import db
import json
from log import log

# Docs
# https://docs.frigate.video/

# Important endpoint
# http://frigate.domain:5000/api/config


class FrigateNvr(StreamSourceImporter):
    def __init__(self, job_id, stream_source):
        super().__init__(job_id, "Frigate NVR", stream_source)

    def download(self):
        if super().download():
            return True
        config_url = f"{self.stream_source.url}/api/config"
        frigate_response = requests.get(
            config_url, headers={"User-Agent": "Snowstream 1.0.0"}
        )
        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=frigate_response.text
        )
        return True

    def parse_watchable_urls(self):
        frigate_config = json.loads(self.cached_data)
        camera_streams = []
        stream_url = (
            f'{self.stream_source.url.replace(":5000",":1984")}/api/stream.mp4?src='
        )
        if "cameras" in frigate_config:
            for camera_name, camera_settings in frigate_config["cameras"].items():
                if "ffmpeg" in camera_settings:
                    if "inputs" in camera_settings["ffmpeg"]:
                        for input in camera_settings["ffmpeg"]["inputs"]:
                            if "roles" in input:
                                if "record" in input["roles"]:
                                    camera_streams.append(
                                        {
                                            "url": f"{stream_url}{camera_name}",
                                            "name": camera_name,
                                        }
                                    )
        new_count = 0
        for camera_stream in camera_streams:
            if not any(
                x.url == camera_stream["url"] for x in self.stream_source.streamables
            ):
                db.op.create_streamable(
                    stream_source_id=self.stream_source.id,
                    url=camera_stream["url"],
                    name=camera_stream["name"],
                )
                new_count += 1
        if new_count > 0:
            db.op.update_job(job_id=self.job_id, message=f"Found {new_count} new streams")
        return True
