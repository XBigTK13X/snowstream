from log import log
from settings import config
config.validate(log)

from db import db

max_failures = config.rabbit_max_failures
delay_seconds = config.rabbit_delay_seconds


import traceback

import json
import message.read
import message.handler.channel_guide_refresh
import message.handler.clean_file_records
import message.handler.delete_media_records
import message.handler.identify_unknown_media
import message.handler.read_media_files
import message.handler.sanitize_file_properties
import message.handler.scan_shelves_content
import message.handler.stream_sources_refresh
import message.handler.update_media_files

from message.job_media_scope import JobMediaScope

handlers = {
    'channel_guide_refresh': message.handler.channel_guide_refresh,
    'clean_file_records': message.handler.clean_file_records,
    'delete_media_records': message.handler.delete_media_records,
    'identify_unknown_media': message.handler.identify_unknown_media,
    'read_media_files': message.handler.read_media_files,
    'update_media_files': message.handler.update_media_files,
    'sanitize_file_properties': message.handler.sanitize_file_properties,
    "scan_shelves_content": message.handler.scan_shelves_content,
    "stream_sources_refresh": message.handler.stream_sources_refresh,
}

def start():
    global max_failures
    global delay_seconds
    global handlers

    def callback(channel, method, properties, body):
        global max_failures
        global delay_seconds
        log.info('')
        payload = json.loads(body)
        job_id = payload["job_id"]
        job = db.op.get_job_by_id(job_id=job_id)
        if job == None or job.status == 'complete':
            # Something glitched out with rabbitmq
            # but snowstream completed the previous run of the job
            # ack the message so rabbitmq doesn't requeue it
            channel.basic_ack(delivery_tag=method.delivery_tag)
            max_failures = 4
            delay_seconds = 5
            return
        user = 'unknown' if 'auth_user' in payload else payload['auth_user']
        db.op.update_job(job_id=job_id,message=f"Message received from {user}. {message.read.count()} messages remain in queue.")
        db.op.update_job(job_id=job_id,message="\n"+json.dumps(payload,indent=4))
        if "kind" in payload:
            db.op.update_job(
                job_id=job_id,
                message="A worker is processing the job.",
                status="running"
            )
            try:
                kind = payload["kind"]
                if kind in handlers:
                    scope = JobMediaScope(job_id,payload['input'])
                    if handlers[kind].handle(scope=scope):
                        db.op.update_job(job_id=job_id, message="The job has completed successfully.", status="complete")
                    else:
                        db.op.update_job(job_id=job_id, message="The job has completed in failure.", status="failed")
                else:
                    db.op.update_job(
                        job_id=job_id,
                        message=f"No registered handler for kind [{payload['kind']}]",
                        status="ignored"
                    )
            except Exception as e:
                db.op.update_job(
                    job_id=job_id,
                    message=f"{e}\n {traceback.format_exc()}",
                    status="failed",
                )
        else:
            db.op.update_job(
                job_id=job_id,
                message=f"No handler provided for {payload['handler']}",
                status="ignored",
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
