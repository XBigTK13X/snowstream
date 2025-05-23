import importlib
from settings import config

from log import log

from db import db

max_failures = config.rabbit_max_failures
delay_seconds = config.rabbit_delay_seconds


def start():
    global max_failures
    global delay_seconds
    import traceback

    import json
    import message.read
    import message.handler.stream_sources_refresh
    import message.handler.scan_shelves_content
    import message.handler.read_media_files
    import message.handler.update_media_files

    from message.handler.job_media_scope import JobMediaScope

    handlers = {
        "stream_sources_refresh": message.handler.stream_sources_refresh,
        "scan_shelves_content": message.handler.scan_shelves_content,
        'read_media_files': message.handler.read_media_files,
        'update_media_files': message.handler.update_media_files
    }

    def callback(channel, method, properties, body):
        global max_failures
        global delay_seconds
        log.info(
            f"Message received {body}. {message.read.count()} messages remain in queue."
        )
        payload = json.loads(body)
        job_id = payload["job_id"]
        if "kind" in payload:
            db.op.update_job(
                job_id=job_id,
                status="running",
                message="A worker is processing the job.",
            )
            try:
                kind = payload["kind"]
                if kind in handlers:
                    # Reload the latest handler code before processing a message
                    # Dont' want cold kill and restart like the API because it could ruin a job run
                    if config.hot_reload_message_handlers == 'yes':
                        importlib.reload(handlers[kind])
                    scope = None
                    if 'input' in payload and payload['input'] != None:
                        scope = JobMediaScope(payload['input'])
                    if handlers[kind].handle(job_id=job_id, scope=scope):
                        db.op.update_job(job_id=job_id, status="complete")
                    else:
                        db.op.update_job(job_id=job_id, status="failed")
                else:
                    db.op.update_job(
                        job_id=job_id,
                        status="ignored",
                        message=f"No registered handler for kind [{payload['kind']}]",
                    )
            except Exception as e:
                db.op.update_job(
                    job_id=job_id,
                    status="failed",
                    message=f"{e}\n {traceback.format_exc()}",
                )
        else:
            db.op.update_job(
                job_id=job_id,
                status="ignored",
                message=f"No handler provided for {payload['handler']}",
            )
        channel.basic_ack(delivery_tag=method.delivery_tag)
        max_failures = 4
        delay_seconds = 5

    while True:
        try:
            message.read.watch(callback)
        except Exception as e:
            raise Exception(
                f"An exception occurred while processing messages.\n{traceback.format_exc()}"
            )


while True:
    try:
        start()
    except Exception as e:
        if max_failures <= 0:
            log.error(f"Unable to launch after multiple retries. Aborting.")
            import sys

            sys.exit(-1)
        import traceback

        log.error(f"{traceback.format_exc()}")
        log.error(
            f"An exception occurred while running the worker. Waiting {delay_seconds} seconds and trying again."
        )
        import time

        time.sleep(delay_seconds)
        delay_seconds *= 2
        max_failures -= 1
