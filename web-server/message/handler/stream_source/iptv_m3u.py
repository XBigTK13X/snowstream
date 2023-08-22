import message.handler.stream_source.base_handler as base
import db_op
import cloudscraper
from log import log


class IptvM3u(base.BaseHandler):
    def download(self, stream_source):
        log.info("IptvM3u stream source updating")
        if stream_source.remote_data:
            log.info("Using cached data from IptvM3u")
            return stream_source

        log.info("Remote data not cached. Get the latest M3U contents")
        scraper = cloudscraper.create_scraper()
        m3u_response = scraper.get(stream_source.url)
        stream_source.remote_data = m3u_response.text
        return db_op.update_stream_source(id=stream_source.id, remote_data=stream_source.remote_data)

    def parse_watchable_urls(self, stream_source):
        streams = []
        stream = {}
        for line in stream_source.remote_data.split('\n'):
            if line[0] == '#':
                # TODO Handle the first line properly and #EXTGRP lines
                if '#EXTINF' in line:
                    stream['name'] = line.split('tvg-name="')[1].split('"')[0]
            else:
                stream['url'] = line
                streams.append(stream)
                stream = {}
        new_count = 0
        for stream in streams:
            if not any(x.url == stream['url'] for x in stream_source.streamables):
                db_op.create_streamable(stream_source_id=stream_source.id, url=stream['url'], name=stream['name'])
                new_count += 1
        if new_count > 0:
            log.info(f"Found {new_count} new streams")
        return stream_source
