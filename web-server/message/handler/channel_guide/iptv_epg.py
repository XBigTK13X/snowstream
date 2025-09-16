from message.handler.channel_guide.guide_source_importer import GuideSourceImporter
from db import db
import cloudscraper
from log import log
from lxml import etree
from datetime import datetime

# Example datetime 20230818231000 +0000
EPG_DATE_TIME_FORMAT = "%Y%m%d%H%M%S %z"


class IptvEpg(GuideSourceImporter):
    def __init__(self, job_id, guide_source):
        super().__init__(job_id, "IPTV EPG", guide_source)

    def download(self):
        if super().download():
            return True
        scraper = cloudscraper.create_scraper()
        xml_response = scraper.get(self.guide_source.url)
        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=xml_response.text
        )
        return True

    def parse_guide_info(self):
        channels = {}
        tree = etree.fromstring(bytes(self.cached_data, encoding="utf8"))
        program_count = 0
        for top_node in tree:
            if "channel" in top_node.tag:
                channel_id = top_node.get("id")
                if not channel_id in channels:
                    channels[channel_id] = {"id": channel_id}
            elif "program" in top_node.tag:
                program_count += 1
                channel_id = top_node.get("channel")
                if not channel_id in channels:
                    channels[channel_id] = {"id": channel_id}
                if not "programs" in channels[channel_id]:
                    channels[channel_id]["programs"] = []
                program = {
                    "start_datetime": top_node.get("start"),
                    "stop_datetime": top_node.get("stop"),
                }
                program["start_datetime"] = datetime.strptime(
                    program["start_datetime"], EPG_DATE_TIME_FORMAT
                )
                program["stop_datetime"] = datetime.strptime(
                    program["stop_datetime"], EPG_DATE_TIME_FORMAT
                )
                for sub_node in top_node:
                    if "title" in sub_node.tag:
                        program["name"] = sub_node.text
                    if "desc" in sub_node.tag:
                        program["description"] = sub_node.text
                channels[channel_id]["programs"].append(program)

        initial_count = len(channels.keys())
        db.op.update_job(job_id=self.job_id, message=f"About to import {initial_count} channels with {program_count} programs")
        prune_count = 0
        channel_count = 0
        for key, val in channels.items():
            if not "programs" in val or len(val["programs"]) == 0:
                prune_count += 1
            else:
                channel_count += 1
                if channel_count % 500 == 0:
                    db.op.update_job(job_id=self.job_id, message=f"Ingesting channel {channel_count} out of {initial_count}")
                channel = db.op.get_channel_by_parsed_id(key)
                if not channel:
                    channel = db.op.create_channel({
                        "channel_guide_source_id":self.guide_source.id,
                        "parsed_id": key
                    })
                for program in val["programs"]:
                    program["channel_id"] = channel.id
                db.op.create_channel_programs(val['programs'])

        db.op.update_job(job_id=self.job_id, message=f"Found programs for {initial_count-prune_count} out of {initial_count} channels.")
        return True
