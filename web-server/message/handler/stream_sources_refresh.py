from log import log

import db_op

from database import DbTruncate

import message.handler.stream_source.hd_home_run as hhr
import message.handler.stream_source.iptv_epg as ie
import message.handler.stream_source.iptv_m3u as im
import message.handler.stream_source.frigate_nvr as fn
import message.handler.stream_source.schedules_direct as sd

source_handlers = {
    'HdHomeRun': hhr.HdHomeRun(),
    'IptvEpg': ie.IptvEpg(),
    'IptvM3u': im.IptvM3u(),
    'FrigateNvr': fn.FrigateNvr(),
    'SchedulesDirect': sd.SchedulesDirect()
}


def handle(job_id, message_payload):
    log.info(f'[WORKER] Handling a stream_sources_refresh job')
    DbTruncate('streamable_schedules')
    stream_sources = db_op.get_stream_source_list(streamables=True)
    refresh_results = {

    }
    for stream_source in stream_sources:
        # TODO Purge all program data that ended at least five minutes ago
        # TODO Most of the backend is dumb pipes, but these handlers could use some unit tests
        log.info("Refreshing stream source "+stream_source.kind)
        handler = source_handlers[stream_source.kind]
        updated_source = handler.download(stream_source)
        if not updated_source:
            refresh_results[stream_source.url] = False
            continue
        updated_source = handler.parse_watchable_urls(stream_source)
        if not updated_source:
            refresh_results[stream_source.url] = False
            continue
        updated_source = handler.parse_guide_info(stream_source)
        if not updated_source:
            refresh_results[stream_source.url] = False
            continue
        refresh_results[stream_source.url] = True
    log.info("All done refreshing stream sources")
    for key, val in refresh_results.items():
        if not val:
            return False
    return True
