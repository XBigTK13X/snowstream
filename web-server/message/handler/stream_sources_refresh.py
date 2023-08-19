from log import log


def handle(job_id, message_payload):
    log.info(f'[WORKER] Handling a stream_sources_refresh job')
