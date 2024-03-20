from log import log
import message.connect

from settings import config


def watch(callback):
    connection, channel = message.connect.create()

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=config.rabbit_queue, on_message_callback=callback)

    log.info("Waiting for messages.")
    channel.start_consuming()


def count():
    connection, channel = message.connect.create()
    queue = channel.queue_declare(
        queue=config.rabbit_queue, durable=True, exclusive=False, auto_delete=False
    )

    result = queue.method.message_count
    connection.close()
    return result
