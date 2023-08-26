import message.handler.stream_source.base_handler as base
import db_op
from database import DbSession
import db_models as dbm
import cloudscraper
from log import log
from lxml import etree
from datetime import datetime

# Example datetime 20230818231000 +0000
EPG_DATE_TIME_FORMAT = '%Y%m%d%H%M%S %z'


class IptvEpg(base.BaseHandler):
    def download(self, stream_source):
        log.info("IptvEpg stream source updating")
        if stream_source.remote_data:
            log.info("Using cached data from IptvEpg")
            return stream_source

        log.info("Remote data not cached. Get the latest EPG contents")
        scraper = cloudscraper.create_scraper()
        m3u_response = scraper.get(stream_source.url)
        stream_source.remote_data = m3u_response.text
        return db_op.update_stream_source(id=stream_source.id, remote_data=stream_source.remote_data)

    def parse_guide_info(self, stream_source):
        channels = {}
        tree = etree.fromstring(bytes(stream_source.remote_data, encoding='utf8'))
        program_count = 0
        for top_node in tree:
            if 'channel' in top_node.tag:
                channel_id = top_node.get('id')
                if not channel_id in channels:
                    channels[channel_id] = {
                        'id': channel_id
                    }
            if 'program' in top_node.tag:
                program_count += 1
                channel_id = top_node.get('channel')
                if not channel_id in channels:
                    channels[channel_id] = {'id': channel_id}
                if not 'programs' in channels[channel_id]:
                    channels[channel_id]['programs'] = []
                program = {
                    'start_datetime': top_node.get('start'),
                    'stop_datetime': top_node.get('stop')
                }
                program['start_datetime'] = datetime.strptime(
                    program['start_datetime'],
                    EPG_DATE_TIME_FORMAT
                )
                program['stop_datetime'] = datetime.strptime(
                    program['stop_datetime'],
                    EPG_DATE_TIME_FORMAT
                )
                for sub_node in top_node:
                    if 'title' in sub_node.tag:
                        program['name'] = sub_node.text
                    if 'desc' in sub_node.tag:
                        program['description'] = sub_node.text
                channels[channel_id]['programs'].append(program)
        initial_count = len(channels.keys())
        log.info(f"About to import {initial_count} channels with {program_count} programs")
        prune_count = 0
        channel_count = 0
        for key, val in channels.items():
            if not 'programs' in val or len(val['programs']) == 0:
                prune_count += 1
            else:
                channel_count += 1
                log.debug(f"({channel_count}/{initial_count}) Processing channel {key}")
                channel = db_op.get_channel_by_parsed_id(key)
                if not channel:
                    channel = db_op.create_channel({'parsed_id': key})
                for program in val['programs']:
                    program['channel_id'] = channel.id
                with DbSession() as db:
                    db.bulk_insert_mappings(dbm.StreamableSchedule, val['programs'])

        log.info(f"Found programs for {initial_count-prune_count} out of {initial_count} channels.")
        return True
