from log import log

from db import db

import message.handler.stream_source.hd_home_run as hhr
import message.handler.stream_source.iptv_epg as ie
import message.handler.stream_source.iptv_m3u as im
import message.handler.stream_source.frigate_nvr as fn
import message.handler.stream_source.schedules_direct as sd

source_handlers = {
    'HdHomeRun': hhr.HdHomeRun,
    'IptvEpg': ie.IptvEpg,
    'IptvM3u': im.IptvM3u,
    'FrigateNvr': fn.FrigateNvr,
    'SchedulesDirect': sd.SchedulesDirect
}


def handle(job_id, message_payload):
    log.info(f'[WORKER] Handling a stream_sources_refresh job')
    log.info("Removing existing streamable schedule info")
    db.sql.truncate('streamable_schedules')
    stream_sources = db.op.get_stream_source_list(streamables=True)
    refresh_results = {

    }
    for stream_source in stream_sources:
        # TODO Purge all program data that ended at least five minutes ago
        # TODO Most of the backend is dumb pipes, but these handlers could use some unit tests
        log.info("Refreshing stream source "+stream_source.kind)
        handler = source_handlers[stream_source.kind](stream_source)

        if not handler.download():
            refresh_results[stream_source.url] = False
            continue
        if not handler.parse_watchable_urls():
            refresh_results[stream_source.url] = False
            continue
        if not handler.parse_guide_info():
            refresh_results[stream_source.url] = False
            continue
        refresh_results[stream_source.url] = True

    log.info("Finished refreshing stream sources")
    log.info("Generating streamable M3U content")

    log.info("Generating streamable EPG XML")
    log.info("Finished stream_sources_refresh job")
    for key, val in refresh_results.items():
        if not val:
            return False
    return True
