import requests
from watchfiles import watch
from datetime import datetime, timedelta, timezone
from log import log
from util import debounce
from settings import config
NGINX_DATE_TIME_FORMAT = '%d/%b/%Y:%H:%M:%S %z'


@debounce(3)
def close_transcode_stream(streamable_id):
    requests.delete(config.web_api_url+'/api/streamable/transcode?streamable_id='+streamable_id)


def monitor_nginx():
    log.info("Watching nginx log files")
    for changes in watch(config.nginx_log_path):
        heartbeat = {}
        with open(config.nginx_log_path, 'r') as read_pointer:
            for line in read_pointer.readlines():
                # 172.17.0.1 - - [27/Sep/2023:17:47:56 +0000] "GET /transcode/120/stream.m3u8 HTTP/1.1" 206 508 "-" "libmpv" "-"
                if 'GET /transcode/' in line:
                    streamable_id = line.split('GET /transcode/')[1].split('/')[0]
                    heartbeat[streamable_id] = {
                        'line': line,
                        'streamable_id': streamable_id
                    }
        for streamable_id, data in heartbeat.items():
            close_transcode_stream(streamable_id)


monitor_nginx()
