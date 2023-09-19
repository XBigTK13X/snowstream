from log import log
import requests

from db import db
import cache
from settings import config
from requests.auth import HTTPBasicAuth

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


def generate_streamable_m3u():
    log.info("Generating streamable M3U content")
    stream_sources = db.op.get_stream_source_list(streamables=True)
    go2rtc_config = ''
    m3u = '#EXTM3U'
    stream_count = 0
    channel_count = 0
    for stream_source in stream_sources:
        stream_channel_count = 0
        stream_count += 1
        for streamable in stream_source.streamables:
            stream_channel_count += 1
            channel_count += 1
            channel_id = f'{stream_count:02}.{stream_channel_count:04}'
            m3u += f'\n#EXTINF: tvg-id="{streamable.name}" tvg-name="{streamable.name}" tvg-logo="" group-title="{stream_source.name}" channel-id="{channel_id}"'
            m3u += f'\n{config.go2rtc_url}/api/stream.mp4?src=channel_{channel_id}'
            go2rtc_config += f'\n  channel_{channel_id}: {streamable.url}'
    m3u += '\n'
    go2rtc_config += '\n'
    log.info(f"Generated m3u with {channel_count} channels")
    db.op.upsert_cached_text(key=cache.key.STREAMABLE_M3U, data=m3u)

    log.info("Updating transcode stream config")
    with open("./message/handler/go2rtc.template") as rp:
        go2rtc_config = rp.read().replace("<SNOWSTREAM_GO2RTC_STREAMS>", go2rtc_config)
    api_response = requests.post(config.go2rtc_url+"/api/config", data=go2rtc_config)
    if not api_response.status_code == 200:
        log.error(f"Unable to update go2rtc config. HTTP Code {api_response.status_code}")
    else:
        supervisor_auth = HTTPBasicAuth(config.supervisor_username, config.supervisor_password)
        supervisor_response = requests.get(
            config.supervisor_url+"/index.html?processname=go2rtc&action=restart", auth=supervisor_auth)
        if not supervisor_response.status_code == 200:
            log.error(f"Unable to restart go2rtc after changing config. HTTP Code {supervisor_response.status_code}")
    return True


def generate_streamable_epg():
    log.info("Generating streamable EPG XML")
    xml = '<?xml version="1.0" encoding="utf-8" ?>\n<!DOCTYPE tv SYSTEM "xmltv.dtd">\n<tv generator-info-name="snowstream">'
    channels = db.op.get_channels_list(schedules=True)
    channel_count = 0
    schedule_count = 0
    for channel in channels:
        channel_count += 1
        xml += f'\n  <channel id="{channel.parsed_name}">'
        for schedule in channel.schedules:
            schedule_count += 1
            xml += f'\n    <program start="{schedule.start_datetime}" stop="{schedule.stop_datetime}" start_timestamp="{schedule.start_datetime.timestamp()}" stop_timestamp="{schedule.stop_datetime.timestamp()}" channel="{channel.parsed_name}" >'
            xml += f'\n    <title>{schedule.name}</title>'
            xml += f'\n    <desc>{schedule.description}</desc>'
            xml += f'\n    </program>'
        xml += '\n  <\channel>'
    xml += '\n</tv>'
    log.info(f'Generated EPG XML with {channel_count} channels and {schedule_count} programs')
    db.op.upsert_cached_text(key=cache.key.STREAMABLE_EPG, data=xml)
    return True


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
    generate_streamable_m3u()
    generate_streamable_epg()
    log.info("Finished stream_sources_refresh job")
    for key, val in refresh_results.items():
        if not val:
            return False
    return True
