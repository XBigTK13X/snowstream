import message.handler.stream_source.base_handler as base
from db import db
import cloudscraper
from log import log


class IptvM3u(base.BaseHandler):
    def __init__(self, stream_source):
        super().__init__("IPTV M3U", stream_source)

    def download(self):
        if super().download():
            return True
        scraper = cloudscraper.create_scraper()
        m3u_response = scraper.get(self.stream_source.url)
        self.cached_data = db.op.create_cached_text(
            key=self.cache_key, data=m3u_response.text
        )
        return True

    def parse_watchable_urls(self):
        streams = []
        stream = {}
        for line in self.cached_data.split("\n"):
            if line[0] == "#":
                # TODO Handle the first line properly and #EXTGRP lines
                if "#EXTINF" in line:
                    stream["name"] = line.split('tvg-name="')[1].split('"')[0]
            else:
                stream["url"] = line
                streams.append(stream)
                stream = {}
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
