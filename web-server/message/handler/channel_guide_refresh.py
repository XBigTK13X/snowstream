from db import db
import cache
import message.handler.channel_guide.iptv_epg as ie
import message.handler.channel_guide.schedules_direct as sd

source_handlers = {
    "IptvEpg": ie.IptvEpg,
    "SchedulesDirect": sd.SchedulesDirect
}

def generate_streamable_epg(job_id:int):
    db.op.update_job(job_id=job_id, message="Generating streamable EPG XML")
    xml = '<?xml version="1.0" encoding="utf-8" ?>\n<!DOCTYPE tv SYSTEM "xmltv.dtd">\n<tv generator-info-name="snowstream">'
    ticket = db.Ticket(ignore_watch_group=True)
    streamables = db.op.get_streamable_list(ticket=ticket)
    channel_count = 0
    program_count = 0
    for streamable in streamables:
        if not streamable.channel:
            continue
        channel = streamable.channel
        channel_count += 1
        xml += f'\n  <channel id="{channel.parsed_name}">'
        for program in channel.programs:
            program_count += 1
            xml += f'\n    <program start="{program.start_datetime}" stop="{program.stop_datetime}" start_timestamp="{program.start_datetime.timestamp()}" stop_timestamp="{program.stop_datetime.timestamp()}" channel="{channel.parsed_name}" >'
            xml += f"\n    <title>{program.name}</title>"
            xml += f"\n    <desc>{program.description}</desc>"
            xml += f"\n    </program>"
        xml += "\n  <\\channel>"
    xml += "\n</tv>"
    db.op.update_job(job_id=job_id, message=
        f"Generated EPG XML with {channel_count} channels and {program_count} programs"
    )
    db.op.upsert_cached_text(
        key=cache.key.STREAMABLE_EPG,
        data=xml
    )
    return True


def handle(scope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling a channel_guide_refresh job")
    guide_sources = None
    if scope.is_guide_source():
        guide_sources = [db.op.get_channel_guide_source_by_id(channel_guide_source_id=scope.target_id)]
    else:
        db.op.update_job(job_id=scope.job_id, message="Removing existing channel program info")
        db.op.delete_all_channel_programs()
        guide_sources = db.op.get_channel_guide_source_list()
    refresh_results = {}
    for guide_source in guide_sources:
        db.op.update_job(job_id=scope.job_id, message="Refreshing channel guide source " + guide_source.kind)
        handler = source_handlers[guide_source.kind](scope.job_id, guide_source)

        if not handler.download():
            refresh_results[guide_source.url] = False
            continue
        if not handler.parse_guide_info():
            refresh_results[guide_source.url] = False
            continue
        refresh_results[guide_source.url] = True

    db.op.update_job(job_id=scope.job_id, message="Finished refreshing stream sources")

    generate_streamable_epg(job_id=scope.job_id)
    db.op.update_job(job_id=scope.job_id, message="Finished stream_sources_refresh job")
    for key, val in refresh_results.items():
        if not val:
            return False
    return True
