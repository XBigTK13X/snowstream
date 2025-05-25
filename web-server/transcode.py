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
import ffmpeg

class Transcode:
    def __init__(self):
        parts = config.transcode_port_range.split('-')
        self.port_start = int(parts[0])
        self.port_end = int(parts[1])

    def get_unused_port(self):
        open_port = self.port_start
        transcode_sessions = db.op.get_transcode_session_list()
        used_ports = [xx.stream_port for xx in transcode_sessions]
        if len(used_ports) == self.port_end - self.port_start:
            return None
        while open_port in used_ports:
            open_port += 1
        return open_port

    def register_cleanup(self):
        atexit.register(self.cleanup)

    def create_session(
        self,
        cduid:int,
        video_file_id:int=None,
        streamable_id:int=None,
        audio_track_index:int=None,
        subtitle_track_index:int=None
    ):
        input_path = None
        if video_file_id != None:
            video_file = db.op.get_video_file_by_id(video_file_id=video_file_id)
            if not video_file:
                return None
            input_path = video_file.local_path
        if streamable_id != None:
            streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
            if not streamable:
                return None
            input_path = streamable.url

        stream_port = self.get_unused_port()

        transcode_session = db.op.create_transcode_session(
            cduid=cduid,
            transcode_directory=None,
            transcode_file=None,
            video_file_id=video_file_id,
            streamable_id=streamable_id,
            stream_port=stream_port
        )
        command,streaming_url = ffmpeg.transcode_command(
            input_url=input_path,
            stream_port=stream_port,
            audio_track_index=audio_track_index,
            subtitle_track_index=subtitle_track_index
        )
        log_path = os.path.join(config.transcode_log_dir,f'{transcode_session.id}.log')
        transcode_process = util.run_cli(command, background=True, log_path=log_path)
        db.op.set_transcode_process_id(transcode_session_id=transcode_session.id,process_id=transcode_process.pid)

        time.sleep(5)

        return {
            'transcode_url': streaming_url,
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
