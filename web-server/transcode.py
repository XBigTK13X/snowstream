from log import log
import os
import util
import signal
import atexit
import time
import shutil

from db import db
from settings import config


transcode_processes = {}
cleanup_registered = False


def stream(streamable: db.model.Streamable):
    global transcode_processes
    global cleanup_registered
    if not cleanup_registered:
        atexit.register(cleanup)
        cleanup_registered = True
    output_dir = f'{config.transcode_dir}/{streamable.id}'
    output_file = os.path.join(output_dir, 'stream.m3u8')
    transcode_base_url = f'{config.transcode_url}/{streamable.id}/'
    transcode_url = f'{transcode_base_url}stream.m3u8'
    if os.path.exists(output_file):
        return transcode_url
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    hls_options = "-f hls -hls_flags delete_segments -hls_time 6 -hls_base_url"
    av_options = "-c:v copy -c:a copy"
    protocol_options = ''
    live_stream_options = '-reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5'
    if streamable.stream_source.kind == "HdHomeRun":
        av_options = f'-c:v libx264 -vf "bwdif,format=yuv420p" -crf 21 -preset veryfast -c:a aac'
    if 'rtsp' in streamable.url:
        protocol_options = "-rtsp_transport tcp"
        live_stream_options = ''
    command = f'ffmpeg -hide_banner {live_stream_options} {protocol_options} -i "{streamable.url}" {av_options} {hls_options} "{transcode_base_url}"  -user_agent ffmpeg/snowstream "{output_file}"'
    log.info(command)
    transcode_process = util.run_cli(command, background=True)
    transcode_processes[streamable.id] = {
        'process': transcode_process,
        'output_dir': output_dir
    }
    log.info(transcode_url)
    max_wait_seconds = 10
    while not os.path.exists(output_file) and max_wait_seconds > 0:
        time.sleep(1)
        max_wait_seconds -= 1
    # TODO If HdHomeRun and HTTP 503 returned, then all tuners in use
    return transcode_url


def cleanup():
    global transcode_processes
    log.info(f"Cleaning up {len(transcode_processes.items())} transcode child processes")
    for k, v in transcode_processes.items():
        os.kill(v['process'].pid, signal.SIGTERM)
        shutil.rmtree(v['output_dir'])
