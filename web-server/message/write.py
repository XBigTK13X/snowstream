import message.connect
import json
from settings import config
import pika


PERSISTENT_DELIVERY_MODE = 2


def send(job_id: int, kind: str = None):
    if kind == None:
        raise Exception("message kind is required when calling message.send()")
    payload = {
        'kind': kind
    }
    payload['job_id'] = job_id
    connection, channel = message.connect.create()
    channel.basic_publish(
        exchange='',
        routing_key=config.rabbit_queue,
        body=json.dumps(payload),
        properties=pika.BasicProperties(
            delivery_mode=PERSISTENT_DELIVERY_MODE,
        )
    )
    connection.close()
    return job_id
