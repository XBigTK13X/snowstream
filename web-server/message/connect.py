import pika

from settings import config


def create():
    credentials = pika.PlainCredentials(config.rabbit_user, config.rabbit_password)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            config.rabbit_host,
            config.rabbit_port,
            "/",
            credentials,
            blocked_connection_timeout=None,
            socket_timeout=None,
            stack_timeout=None,
            heartbeat=0
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue=config.rabbit_queue, durable=True)
    return connection, channel
