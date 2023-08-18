from settings import config

max_failures = config.rabbit_max_failures
delay_seconds = config.rabbit_delay_seconds

def start():
    global max_failures
    global delay_seconds
    import traceback

    import json
    import message.read
    from message.handler import extract_file_system_root
    from message.handler import extract_file_system_directory
    from message.handler import extract_reddit_saves
    from message.handler import extract_imgur_link
    from message.handler import extract_ripme_link
    from message.handler import extract_youtube_dl_link
    from message.handler import transform_media
    from message.handler import extract_reddit_post
    from message.handler import regenerate_thumbnails


    default_status = "running"
    failed_status = "failed"

    def callback(channel, method, properties, body):
        global max_failures
        global delay_seconds
        print(f"Message received {body}. {message.read.count()} messages remain in queue.")
        payload = json.loads(body)
        errors = False
        if 'handler' in payload:
            job_id = payload['job_id']
            job = Job.objects.get(id=job_id)
            job.logs = payload['log_entry'];
            job.logs += f"\n{body}"
            job.status_id = default_status.id
            job.save()
            try:
                handler = payload['handler']
                if handler == 'extract-reddit-saves':
                    extract_reddit_saves.handle(job, payload)
                elif handler == 'extract-file-system-root':
                    extract_file_system_root.handle(job, payload)
                elif handler == 'extract-file-system-directory':
                    extract_file_system_directory.handle(job, payload)
                elif handler == 'extract-imgur-link':
                    extract_imgur_link.handle(job, payload)
                elif handler == 'extract-reddit-post':
                    extract_reddit_post.handle(job, payload)
                elif handler == 'extract-ripme-link':
                    extract_ripme_link.handle(job, payload)
                elif handler == 'extract-youtube-dl-link':
                    extract_youtube_dl_link.handle(job, payload)
                elif handler == 'transform-media':
                    transform_media.handle(job, payload)
                elif handler == 'regenerate-thumbnails':
                    regenerate_thumbnails.handle(job,payload)
                else:
                    print(f"Unknown handler [{handler}]")
            except Exception as e:
                errors = True
                job.status_id = failed_status.id
                orm.job_log(job, f"{e}\n {traceback.format_exc()}")
        else:
            orm.job_log(job, f"No handler provided for {payload['handler']}")
            print(f"No handler provided")
        orm.job_log(job,"Job finished processing")
        print(f"Message processed with{'' if errors else ' no'} errors")
        channel.basic_ack(delivery_tag=method.delivery_tag)
        max_failures=4
        delay_seconds = 5
    while True:
        try:
            message.read.watch(callback)
        except Exception as e:
            raise Exception(f"An exception occurred while processing messages.\n{traceback.format_exc()}")

while True:
    try:
        start()
    except Exception as e:
        if max_failures <= 0:
            print(f"Unable to launch after multiple retries. Aborting.")
            import system
            system.exit(-1)
        import traceback
        print(f"{traceback.format_exc()}")
        print(f"An exception occurred while running the worker. Waiting {delay_seconds} seconds and trying again.")
        import time
        time.sleep(delay_seconds)
        delay_seconds *= 2
        max_failures -= 1