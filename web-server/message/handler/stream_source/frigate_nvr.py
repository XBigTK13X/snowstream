import message.handler.stream_source.base_handler as base
import requests
import db_op
import json
from log import log

# http://nvr.9914.us:5000/api/config


class FrigateNvr(base.BaseHandler):
    def download(self, stream_source):
        log.info("FrigateNvr stream source updating")
        if stream_source.remote_data:
            log.info("Using cached data from Frigate NVR")
            return stream_source

        log.info("Remote data not cached. Get the latest from the NVR API")
        config_url = f'{stream_source.url}/api/config'
        frigate_response = requests.get(config_url)
        stream_source.remote_data = frigate_response.text
        return db_op.update_stream_source(id=stream_source.id, remote_data=stream_source.remote_data)

    def parse_watchable_urls(self, stream_source):
        frigate_config = json.loads(stream_source.remote_data)
        camera_streams = []
        frigate_domain = stream_source.url.split('://')[1].split(':')[0]
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
        for camera_stream in camera_streams:
            if not any(x.url == camera_stream['url'] for x in stream_source.streamables):
                db_op.create_streamable(stream_source_id=stream_source.id, url=camera_stream['url'], name=camera_stream['name'])
        return stream_source
