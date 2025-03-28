from log import log
import os
import util
import signal
import atexit
import time
import shutil
from util import debounce
from pathlib import Path
from db import db
from database import db_models as dm
from settings import config


class Transcode:    
    def register_cleanup(self):
        atexit.register(self.cleanup)

    # TODO apply fitlers/tag restrictions/shelf access
    def create_session(
        self,
        cduid:int,
        video_file_id:int=None,
        streamable_id:int=None
    ):
        input_path = None
        output_dir = None
        live_stream_options = ""
        protocol_options = ''
        if video_file_id != None:
            video_file = db.op.get_video_file_by_id(video_file_id=video_file_id)
            if not video_file:
                return None
            input_path = video_file.local_path
            output_dir = f"{config.transcode_dir}/video/{video_file.id}"
        if streamable_id != None:
            streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
            if not streamable:
                return None
            input_path = streamable.url
            output_dir = f"{config.transcode_dir}/streamable/{streamable.id}"
            live_stream_options = "-reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 6"
            if "rtsp" in streamable.url:
                protocol_options = "-rtsp_transport tcp"

        output_dir = f'{Path(output_dir).absolute()}'
        output_file = os.path.join(output_dir, "stream.m3u8")
        transcode_session = db.op.create_transcode_session(
            cduid=cduid,
            transcode_directory=output_dir,
            transcode_file=output_file,
            video_file_id=video_file_id,
            streamable_id=streamable_id
        )
        transcode_segment_url = f"{config.web_api_url}/api/transcode/segment?transcode_session_id={transcode_session.id}&segment_file="
        transcode_playlist_url = f"{config.web_api_url}/api/transcode/playlist.m3u8?transcode_session_id={transcode_session.id}"
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)            
        os.makedirs(output_dir,exist_ok=True)
        hls_options = f'-f hls -hls_flags delete_segments -hls_time 30 -hls_base_url "{transcode_segment_url}"'
        av_options = f'-c:v {config.transcode_video_codec} -preset medium -vf "bwdif,format=yuv420p" -c:a aac'
        
        command = f'ffmpeg -hide_banner {live_stream_options}'
        command += f' {protocol_options} -i "{input_path}" {av_options}'
        command += f' {hls_options} -user_agent ffmpeg/snowstream "{output_file}"'
        log.info(command)

        transcode_process = util.run_cli(command, background=True)
        db.op.set_transcode_process_id(transcode_session_id=transcode_session.id,process_id=transcode_process.pid)

        max_wait_seconds = config.transcode_create_max_wait_seconds
        while not os.path.exists(output_file):
            if max_wait_seconds <= 0:
                log.info(f"Unable to create transcode file: {output_file}")
                break
            time.sleep(1)
            max_wait_seconds -= 1
        return {
            'transcode_url': transcode_playlist_url,
            'transcode_session_id': transcode_session.id
        } 

    def get_playlist_content(self, transcode_session_id:int):
        transcode_session = db.op.get_transcode_session_by_id(transcode_session_id=transcode_session_id)
        if not transcode_session:
            return None
        binary_data = None
        playlist_path = transcode_session.transcode_file
        max_wait_seconds = config.transcode_create_max_wait_seconds
        while not os.path.exists(playlist_path) and max_wait_seconds > 0:
            time.sleep(1)
            max_wait_seconds -= 1
        with open(playlist_path, "rb") as read_handle:
            binary_data = read_handle.read()
        self.close_on_disconnect(transcode_session=transcode_session)
        return binary_data

    def get_stream_segment(self, segment_file: str, transcode_session_id: int):
        transcode_session = db.op.get_transcode_session_by_id(transcode_session_id=transcode_session_id)
        if not transcode_session:
            return None
        binary_data = None        
        segment_path = os.path.join(transcode_session.transcode_directory, segment_file)
        while not os.path.exists(segment_path) and max_wait_seconds > 0:
            time.sleep(1)
            max_wait_seconds -= 1
        with open(segment_path, "rb") as read_handle:
            binary_data = read_handle.read()
        self.close_on_disconnect(transcode_session=transcode_session)
        return binary_data

    @debounce(config.transcode_disconnect_seconds)
    def close_on_disconnect(self, transcode_session:dm.TranscodeSession):
        self.close(transcode_session=transcode_session)

    def close(self, transcode_session:dm.TranscodeSession=None,transcode_session_id:int=None):
        if transcode_session_id:
            transcode_session = db.op.get_transcode_session_by_id(transcode_session_id=transcode_session_id)        
        os.kill(transcode_session.process_id, signal.SIGTERM)
        shutil.rmtree(transcode_session.transcode_directory,ignore_errors=True)
        db.op.delete_transcode_session(transcode_session_id=transcode_session.id)

    def cleanup(self):
        transcode_sessions = db.op.get_transcode_session_list()
        if transcode_sessions and len(transcode_sessions) > 0:
            log.info(f"Cleaning up {len(transcode_sessions)} transcode child processes")
            for transcode_session in transcode_sessions:
                self.close(transcode_session=transcode_session)

transcode = Transcode()
