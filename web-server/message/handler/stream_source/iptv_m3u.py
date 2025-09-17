from message.handler.stream_source.stream_source_importer import StreamSourceImporter
from db import db
import cloudscraper
from log import log

class IptvM3u(StreamSourceImporter):
    def __init__(self, job_id, stream_source):
        super().__init__(job_id, "IPTV M3U", stream_source)

    def download(self):
        if super().download():
            return True
        scraper = cloudscraper.create_scraper()
        m3u_response = scraper.get(self.stream_source.url)
        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=m3u_response.text
        )
        return True

    def parse_watchable_urls(self):
        streams = []
        stream = {}
        for line in self.cached_data.split("\n"):
            if line[0] == "#":
                if "#EXTINF" in line:
                    name = line.split('tvg-name="')[1].split('"')[0]
                    name = name.replace('USA','')
                    name = name.replace('US:','')
                    name = name.replace('UKHD:','')
                    name = name.replace('UK','')
                    name = name.replace('&amp;','and')
                    name = name.replace('HD','')
                    name = name.replace('4K','')
                    name = name.replace('JNR','Junior')
                    name = name.replace('Channel','')
                    name = name.split('(')[0]
                    name = name.strip().title()
                    name = name.replace('Gsn','GSN')
                    name = name.replace('Xd','XD')
                    name = name.replace('Tv','TV')
                    name = name.replace('Pbs','PBS')
                    name = name.replace('Tcm','TCM')
                    name = name.replace('Hbo','HBO')
                    stream["name"] = name
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
            db.op.update_job(job_id=self.job_id, message=f"Found {new_count} new streams")
        return True
