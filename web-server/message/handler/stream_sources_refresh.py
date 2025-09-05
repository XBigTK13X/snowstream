from log import log
from db import db
import cache
from settings import config
import copy

import message.handler.stream_source.hd_home_run as hhr
import message.handler.stream_source.iptv_epg as ie
import message.handler.stream_source.iptv_m3u as im
import message.handler.stream_source.frigate_nvr as fn
import message.handler.stream_source.schedules_direct as sd
import message.handler.stream_source.tube_archivist as ta

source_handlers = {
    "HdHomeRun": hhr.HdHomeRun,
    "IptvEpg": ie.IptvEpg,
    "IptvM3u": im.IptvM3u,
    "FrigateNvr": fn.FrigateNvr,
    "SchedulesDirect": sd.SchedulesDirect,
    'TubeArchivist': ta.TubeArchivist
}


def generate_streamable_m3u(job_id:int):
    db.op.update_job(job_id=job_id, message="Generating streamable M3U content")
    stream_sources = db.op.get_stream_source_list(ticket=db.Ticket(ignore_watch_group=True),streamables=True)

    m3u = "#EXTM3U"
    stream_count = 0
    channel_count = 0
    for stream_source in stream_sources:
        stream_channel_count = 0
        stream_count += 1
        for streamable in stream_source.streamables:
            stream_channel_count += 1
            channel_count += 1
            channel_id = f"{stream_count:02}.{stream_channel_count:04}"
            m3u += f'\n#EXTINF: tvg-id="{streamable.name}" tvg-name="{streamable.name}" tvg-logo="" group-title="{stream_source.name}" channel-id="{channel_id}"'
            m3u += f"\n{config.web_api_url}/api/streamable/transcode?streamable_id={streamable.id}"
            m3u += f'\n#EXTINF: tvg-id="{streamable.name} (d)" tvg-name="{streamable.name}" tvg-logo="" group-title="{stream_source.name}" channel-id="{channel_id} (d)"'
            m3u += f"\n{config.web_api_url}/api/streamable/direct?streamable_id={streamable.id}"
    m3u += "\n"
    db.op.update_job(job_id=job_id, message=f"Generated m3u with {channel_count} channels")
    db.op.upsert_cached_text(
        key=cache.key.STREAMABLE_M3U,
        data=m3u
    )
    return True


def generate_streamable_epg(job_id:int):
    db.op.update_job(job_id=job_id, message="Generating streamable EPG XML")
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
            xml += f"\n    <title>{schedule.name}</title>"
            xml += f"\n    <desc>{schedule.description}</desc>"
            xml += f"\n    </program>"
        xml += "\n  <\\channel>"
    xml += "\n</tv>"
    db.op.update_job(job_id=job_id, message=
        f"Generated EPG XML with {channel_count} channels and {schedule_count} programs"
    )
    db.op.upsert_cached_text(
        key=cache.key.STREAMABLE_EPG,
        data=xml
    )
    return True


def handle(scope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling a stream_sources_refresh job")
    stream_sources = None
    if scope.is_stream_source():
        stream_sources = [db.op.get_stream_source_by_id(ticket=db.Ticket(),stream_source_id=scope.target_id)]
    else:
        db.op.update_job(job_id=scope.job_id, message="Removing existing streamable schedule info")
        db.op.delete_all_schedules()
        stream_sources = db.op.get_stream_source_list(ticket=db.Ticket(ignore_watch_group=True),streamables=True)
    refresh_results = {}
    for stream_source in stream_sources:
        db.op.update_job(job_id=scope.job_id, message="Refreshing stream source " + stream_source.kind)
        handler = source_handlers[stream_source.kind](scope.job_id, stream_source)

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

    cleanup_rules = db.op.get_display_cleanup_rule_list()
    streamables = []
    if scope.is_stream_source():
        streamables = db.op.get_stream_source_by_id(ticket=db.Ticket(),stream_source_id=scope.target_id).streamables
    else:
        streamables = db.op.get_streamable_list()

    db.op.update_job(job_id=scope.job_id, message=f"Applying {len(cleanup_rules)} cleanup rules to {len(streamables)} streamables")
    for streamable in streamables:
        name_display = copy.copy(streamable.name)
        group_display = copy.copy(streamable.group)
        for rule in cleanup_rules:
            if rule.target_kind != 'All' and rule.target_kind != streamable.stream_source.kind:
                continue
            replacement = rule.replacement if rule.replacement else ''
            if name_display:
                name_display = name_display.replace(rule.needle, replacement)
            if group_display:
                group_display = group_display.replace(rule.needle, replacement)
        if name_display != streamable.name or group_display != streamable.group:
            if streamable.name_display != name_display or streamable.group_display != group_display:
                db.op.update_streamable_display(
                    streamable_id=streamable.id,
                    group_display=group_display,
                    name_display=name_display
                )

    db.op.update_job(job_id=scope.job_id, message="Finished refreshing stream sources")
    generate_streamable_m3u(job_id=scope.job_id)
    generate_streamable_epg(job_id=scope.job_id)
    db.op.update_job(job_id=scope.job_id, message="Finished stream_sources_refresh job")
    for key, val in refresh_results.items():
        if not val:
            return False
    return True
