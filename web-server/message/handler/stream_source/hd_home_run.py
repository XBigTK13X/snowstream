import message.handler.stream_source.base_handler as base
import requests
import db_op
import json
from log import log

# Docs
# https://info.hdhomerun.com/info/http_api

# Important endpoints
# http://hdhomerun.local/lineup.json
# http://hdhomerun.local/lineup.xml
# http://hdhomerun.local/lineup.m3u


class HdHomeRun(base.BaseHandler):
    def download(self, stream_source):
        log.info("HDHomeRun stream source updating")
        if stream_source.remote_data:
            log.info("Using cached data from HDHomeRun")
            return stream_source

        log.info("Remote data not cached. Get the latest from the HDHomeRun API")
        config_url = f'{stream_source.url}/lineup.json'
        hdhomerun_response = requests.get(config_url, headers={'User-Agent': 'Snowstream 1.0.0'})
        stream_source.remote_data = hdhomerun_response.text
        return db_op.update_stream_source(id=stream_source.id, remote_data=stream_source.remote_data)

    def parse_watchable_urls(self, stream_source):
        hhr_lineup = json.loads(stream_source.remote_data)
        streams = []
        for entry in hhr_lineup:
            streams.append({
                'url': entry['URL'],
                'name': entry['GuideName']
            })
        new_count = 0
        for stream in streams:
            if not any(x.url == stream['url'] for x in stream_source.streamables):
                db_op.create_streamable(stream_source_id=stream_source.id, url=stream['url'], name=stream['name'])
                new_count += 1
        if new_count > 0:
            log.info(f"Found {new_count} new streams")
        return stream_source
