from log import log
import os
import util
import signal
import atexit
import time
import shutil
from util import debounce

from db import db
from settings import config


class Transcode:
    def __init__(self):
        self.transcode_processes = {}
        self.cleanup_registered = False

    def open(self, streamable: db.model.Streamable):
        if not self.cleanup_registered:
            atexit.register(self.cleanup)
            self.cleanup_registered = True
        output_dir = f'{config.transcode_dir}/{streamable.id}'
        output_file = os.path.join(output_dir, 'stream.m3u8')
        transcode_base_url = f'/api/streamable/transcode/segment?streamable_id={streamable.id}&segment_file='
        transcode_url = f'/api/streamable/transcode?streamable_id={streamable.id}'
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        os.makedirs(output_dir)
        hls_options = f'-f hls -hls_flags delete_segments -hls_time 6 -hls_base_url "{transcode_base_url}"'
        av_options = "-c:v copy -c:a copy"
        protocol_options = ''
        live_stream_options = '-reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5'
        if streamable.stream_source.kind == "HdHomeRun":
            av_options = f'-c:v h264_nvenc -preset fast -vf "bwdif,format=yuv420p" -c:a aac'
        if 'rtsp' in streamable.url:
            protocol_options = "-rtsp_transport tcp"
            live_stream_options = ''
        command = f'ffmpeg -hide_banner {live_stream_options} {protocol_options} -i "{streamable.url}" {av_options} {hls_options} -user_agent ffmpeg/snowstream "{output_file}"'
        log.info(command)
        transcode_process = util.run_cli(command, background=True)
        self.transcode_processes[streamable.id] = {
            'process': transcode_process,
            'output_dir': output_dir,
            'streamable_id': streamable.id,
            'output_file': output_file
        }
        max_wait_seconds = 10
        while not os.path.exists(output_file) and max_wait_seconds > 0:
            time.sleep(1)
            max_wait_seconds -= 1
        # TODO If HdHomeRun and HTTP 503 returned, then all tuners in use or channel not available (low signal)
        return transcode_url

    def is_open(self, streamable_id: int):
        return streamable_id in self.transcode_processes

    def get_playlist(self, streamable_id: int):
        transcode_process = self.transcode_processes[streamable_id]
        binary_data = None
        playlist_path = transcode_process['output_file']
        with open(playlist_path, 'rb') as read_pointer:
            binary_data = read_pointer.read()
        self.close_on_disconnect(streamable_id=streamable_id)
        return binary_data

    def get_segment(self, streamable_id: int, segment_file: str):
        if not self.is_open(streamable_id):
            return None
        binary_data = None
        transcode_process = self.transcode_processes[streamable_id]
        segment_path = os.path.join(transcode_process['output_dir'], segment_file)
        with open(segment_path, 'rb') as read_pointer:
            binary_data = read_pointer.read()
        self.close_on_disconnect(streamable_id=streamable_id)
        return binary_data

    @debounce(config.transcode_disconnect_seconds)
    def close_on_disconnect(self, streamable_id: int):
        self.close(streamable_id)

    def close(self, streamable_id: int):
        if self.is_open(streamable_id):
            self.kill(self.transcode_processes[streamable_id])

    def kill(self, transcode_process: dict):
        os.kill(transcode_process['process'].pid, signal.SIGTERM)
        shutil.rmtree(transcode_process['output_dir'])
        del self.transcode_processes[transcode_process['streamable_id']]

    def cleanup(self):
        children = self.transcode_processes.items()
        if len(children) > 0:
            log.info(f"Cleaning up {len(children)} transcode child processes")
            for k, v in children:
                self.kill(transcode_process=v)


transcode = Transcode()
