from log import log


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
