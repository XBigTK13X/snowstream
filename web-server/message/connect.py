import pika

from settings import config

ONE_DAY_SECONDS = 86400
DISABLE_TIMEOUT = None
DISABLE_HEARTBEAT = 0


def create():
    credentials = pika.PlainCredentials(config.rabbit_user, config.rabbit_password)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            config.rabbit_host,
            config.rabbit_port,
            "/",
            credentials,
            blocked_connection_timeout=ONE_DAY_SECONDS,
            socket_timeout=DISABLE_TIMEOUT,
            stack_timeout=DISABLE_TIMEOUT,
            heartbeat=DISABLE_HEARTBEAT
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue=config.rabbit_queue, durable=True)
    return connection, channel
