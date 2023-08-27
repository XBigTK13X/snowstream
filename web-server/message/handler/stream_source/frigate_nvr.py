import message.handler.stream_source.base_handler as base
import requests
from db import db
import json
from log import log

# Docs
# https://docs.frigate.video/

# Important endpoint
# http://frigate.domain:5000/api/config


class FrigateNvr(base.BaseHandler):
    def __init__(self, stream_source):
        super().__init__('Frigate NVR', stream_source)

    def download(self):
        if super().download():
            return True
        config_url = f'{self.stream_source.url}/api/config'
        frigate_response = requests.get(config_url, headers={'User-Agent': 'Snowstream 1.0.0'})
        self.cached_data = db.op.create_cached_text(key=self.cache_key, data=frigate_response.text)
        return True

    def parse_watchable_urls(self):
        frigate_config = json.loads(self.cached_data)
        camera_streams = []
        frigate_domain = self.stream_source.url.split('://')[1].split(':')[0]
        if 'cameras' in frigate_config:
            for camera_name, camera_settings in frigate_config['cameras'].items():
                if 'ffmpeg' in camera_settings:
                    if 'inputs' in camera_settings['ffmpeg']:
                        for input in camera_settings['ffmpeg']['inputs']:
                            if 'roles' in input:
                                if 'record' in input['roles']:
                                    camera_streams.append({
                                        'url': input['path'].replace('127.0.0.1', frigate_domain),
                                        'name': camera_name
                                    })
        new_count = 0
        for camera_stream in camera_streams:
            if not any(x.url == camera_stream['url'] for x in self.stream_source.streamables):
                db.op.create_streamable(stream_source_id=self.stream_source.id,
                                        url=camera_stream['url'], name=camera_stream['name'])
                new_count += 1
        if new_count > 0:
            log.info(f"Found {new_count} new streams")
        return True
