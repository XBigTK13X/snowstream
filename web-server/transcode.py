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
        # TODO Rewrite using db.model.TranscodeSession
        self.transcode_processes = {}
        self.cleanup_registered = False

    def open_video_file(self, video_file: db.model.VideoFile):
        if not self.cleanup_registered:
            atexit.register(self.cleanup)
            self.cleanup_registered = True
        output_dir = f"{config.transcode_dir}/video/{video_file.id}"
        output_file = os.path.join(output_dir, "stream.m3u8")
        transcode_base_url = f"{config.web_api_url}/api/video/transcode/segment?video_file_id={video_file.id}&segment_file="
        transcode_url = f"{config.web_api_url}/api/video/transcode?video_file_id={video_file.id}"
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        os.makedirs(output_dir,exist_ok=True)
        hls_options = f'-f hls -hls_flags delete_segments -hls_time 4 -hls_base_url "{transcode_base_url}"'
        av_options = "-c:v copy -c:a copy"
        protocol_options = ""
        live_stream_options = ""
        command = f'ffmpeg -hide_banner {live_stream_options} {protocol_options} -i "{video_file.path}" {av_options} {hls_options} -user_agent ffmpeg/snowstream "{output_file}"'
        log.info(command)
        transcode_process = util.run_cli(command, background=True)
        self.transcode_processes[f'video_file-{video_file.id}'] = {
            "process": transcode_process,
            "output_dir": output_dir,
            "video_file_id": video_file.id,
            "output_file": output_file,
        }
        import pprint
        pprint.pprint(self.transcode_processes)
        max_wait_seconds = 10
        while not os.path.exists(output_file):
            if max_wait_seconds <= 0:
                log.info(f"Unable to create transcode file: {output_file}")
                break
            time.sleep(1)
            max_wait_seconds -= 1
        return transcode_url

    def open_streamable(self, streamable: db.model.Streamable):
        if not self.cleanup_registered:
            atexit.register(self.cleanup)
            self.cleanup_registered = True
        output_dir = f"{config.transcode_dir}/streamable/{streamable.id}"
        output_file = os.path.join(output_dir, "stream.m3u8")
        transcode_base_url = f"{config.web_api_url}/api/streamable/transcode/segment?streamable_id={streamable.id}&segment_file="
        transcode_url = f"{config.web_api_url}/api/streamable/transcode?streamable_id={streamable.id}"
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        os.makedirs(output_dir,exist_ok=True)
        hls_options = f'-f hls -hls_flags delete_segments -hls_time 4 -hls_base_url "{transcode_base_url}"'
        av_options = "-c:v copy -c:a copy"
        protocol_options = ""
        # These are only used for HTTP based sources
        live_stream_options = "-reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 6"
        if streamable.stream_source.kind == "HdHomeRun":
            av_options = (
                f'-c:v h264_nvenc -preset fast -vf "bwdif,format=yuv420p" -c:a aac'
            )
        if "rtsp" in streamable.url:
            protocol_options = "-rtsp_transport tcp"
            live_stream_options = ""
        command = f'ffmpeg -hide_banner {live_stream_options} {protocol_options} -i "{streamable.url}" {av_options} {hls_options} -user_agent ffmpeg/snowstream "{output_file}"'
        log.info(command)
        transcode_process = util.run_cli(command, background=True)
        self.transcode_processes[f'streamable-{streamable.id}'] = {
            "process": transcode_process,
            "output_dir": output_dir,
            "streamable_id": streamable.id,
            "output_file": output_file,
        }
        max_wait_seconds = 10
        while not os.path.exists(output_file):
            if max_wait_seconds <= 0:
                log.info(f"Unable to create transcode file: {output_file}")
                break
            time.sleep(1)
            max_wait_seconds -= 1
        # TODO If HdHomeRun and HTTP 503 returned, then all tuners in use or channel not available (low signal)
        return transcode_url

    def is_open(self, streamable_id: int = None,video_file_id:int = None):
        if streamable_id != None:
            return f'streamable-{streamable_id}' in self.transcode_processes
        if video_file_id != None:
            return f'video_file-{video_file_id}' in self.transcode_processes

    def get_playlist(self, streamable_id: int = None, video_file_id:int = None):
        transcode_process = None
        if streamable_id != None:
            transcode_process = self.transcode_processes[f'streamable-{streamable_id}']
        if video_file_id != None:
            transcode_process = self.transcode_processes[f'video_file-{video_file_id}']
        binary_data = None
        playlist_path = transcode_process["output_file"]
        max_wait_seconds = 10
        while not os.path.exists(playlist_path) and max_wait_seconds > 0:
            time.sleep(1)
            max_wait_seconds -= 1
        with open(playlist_path, "rb") as read_handle:
            binary_data = read_handle.read()
        if streamable_id != None:
            self.close_on_disconnect(streamable_id=streamable_id)
        if video_file_id != None:
            self.close_on_disconnect(video_file_id=video_file_id)
        return binary_data

    def get_segment(self, segment_file: str, streamable_id: int = None, video_file_id:int = None):
        if not self.is_open(streamable_id):
            return None
        binary_data = None
        transcode_process = None
        if streamable_id != None:
            transcode_process = self.transcode_processes[f'streamable-{streamable_id}']
        if video_file_id != None:
            transcode_process = self.transcode_processes[f'video_file-{video_file_id}']
        segment_path = os.path.join(transcode_process["output_dir"], segment_file)
        while not os.path.exists(segment_path) and max_wait_seconds > 0:
            time.sleep(1)
            max_wait_seconds -= 1
        with open(segment_path, "rb") as read_handle:
            binary_data = read_handle.read()
        if streamable_id != None:
            self.close_on_disconnect(streamable_id=streamable_id)
        if video_file_id != None:
            self.close_on_disconnect(video_file_id=video_file_id)
        return binary_data

    @debounce(config.transcode_disconnect_seconds)
    def close_on_disconnect(self, streamable_id: int = None, video_file_id: int = None):
        pass
        #self.close(streamable_id = streamable_id, video_file_id = video_file_id)

    def close(self, streamable_id: int = None, video_file_id: int = None):
        if streamable_id != None and self.is_open(streamable_id=streamable_id):
            self.kill(self.transcode_processes[f'streamable-{streamable_id}'])
        if video_file_id != None and self.is_open(video_file_id=video_file_id):
            self.kill(self.transcode_processes[f'video_file-{video_file_id}'])

    def kill(self, transcode_process: dict):
        os.kill(transcode_process["process"].pid, signal.SIGTERM)
        shutil.rmtree(transcode_process["output_dir"],ignore_errors=True)
        if 'streamable_id' in transcode_process:
            if transcode_process["streamable_id"] in self.transcode_processes:
                del self.transcode_processes[transcode_process["streamable_id"]]
        if 'video_file_id' in transcode_process:
            if transcode_process["video_file_id"] in self.transcode_processes:
                del self.transcode_processes[transcode_process["video_file_id"]]

    def cleanup(self):
        children = self.transcode_processes.items()
        if len(children) > 0:
            log.info(f"Cleaning up {len(children)} transcode child processes")
            for k, v in children:
                self.kill(transcode_process=v)


transcode = Transcode()
