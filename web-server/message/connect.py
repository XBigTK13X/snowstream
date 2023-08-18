import pika

import settings

def create():
    credentials = pika.PlainCredentials(settings.rabbit_user, settings.rabbit_password)
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        settings.rabbit_host,
        settings.rabbit_port,
        '/',
        credentials,
        blocked_connection_timeout=None,
        socket_timeout=None,
        stack_timeout=None
    ))
    channel = connection.channel()
    channel.queue_declare(queue=settings.rabbit_queue, durable=True)
    return connection, channel