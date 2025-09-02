from log import log
import atexit
import snow_media.transcode_cli
import json
import os
import shutil
import signal
import time
import traceback
import util

from db import db
from database import db_models as dm
from settings import config

class TranscodeSessions:
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
        ticket:db.Ticket,
        device_profile:str=None,
        video_file_id:int=None,
        streamable_id:int=None,
        audio_track_index:int=None,
        subtitle_track_index:int=None,
        seek_to_seconds:int=None
    ):
        existing = db.op.get_transcode_session(cduid=ticket.cduid,video_file_id=video_file_id,streamable_id=streamable_id)
        if existing:
            self.refresh_known_processes()
            if seek_to_seconds == None:
                if self.process_is_running(existing):
                    return existing
                else:
                    db.op.delete_transcode_session(transcode_session_id=existing.id)
            else:
                if self.process_is_running(existing):
                    try:
                        os.kill(existing.process_id)
                    except Exception as e:
                        log.info("Unable to kill supposedly running transcode process")
                db.op.delete_transcode_session(transcode_session_id=existing.id)
        input_path = None
        snowstream_info = None
        if video_file_id != None:
            video_file = db.op.get_video_file_by_id(video_file_id=video_file_id)
            if not video_file:
                return None
            input_path = video_file.local_path
            snowstream_info = json.loads(video_file.snowstream_info_json)
        if streamable_id != None:
            streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
            if not streamable:
                return None
            input_path = streamable.url

        stream_port = self.get_unused_port()

        transcode_session = db.op.create_transcode_session(
            cduid=ticket.cduid,
            video_file_id=video_file_id,
            streamable_id=streamable_id,
            stream_port=stream_port
        )
        command,streaming_url = snow_media.transcode_cli.build_command(
            device_profile=device_profile,
            input_url=input_path,
            snowstream_info=snowstream_info,
            stream_port=stream_port,
            audio_track_index=audio_track_index,
            subtitle_track_index=subtitle_track_index,
            seek_to_seconds=seek_to_seconds
        )
        client_device = ticket.client.client_device.reported_name
        log_name = f'{transcode_session.id}-{client_device}-'
        if video_file_id:
            log_name += f'v-{video_file_id}'
        elif streamable_id:
            log_name += f's-{streamable_id}'
        log_name += '.log'
        log_path = os.path.join(config.transcode_log_dir,log_name)
        log.info("Logging to "+log_path)
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

    def refresh_known_processes(self):
        self.pid_is_ffmpeg = {}
        result = util.run_cli('jc -p ps aux',raw_output=True)
        processes = json.loads(result['stdout'])
        for process in processes:
            if 'ffmpeg' in process['command']:
                self.pid_is_ffmpeg[process['pid']] = process['command']

    @util.debounce(config.transcode_disconnect_seconds)
    def close_on_disconnect(self, transcode_session:dm.TranscodeSession):
        self.refresh_known_processes()
        self.close(transcode_session=transcode_session)

    def process_is_running(self, transcode_session):
        return transcode_session.process_id in self.pid_is_ffmpeg and f'{transcode_session.stream_port}' in self.pid_is_ffmpeg[transcode_session.process_id]

    def close(self, transcode_session:dm.TranscodeSession=None,transcode_session_id:int=None):
        try:
            if transcode_session_id:
                transcode_session = db.op.get_transcode_session_by_id(transcode_session_id=transcode_session_id)
                if not transcode_session:
                    return True
            try:
                if self.process_is_running(transcode_session):
                    os.kill(transcode_session.process_id, signal.SIGTERM)
            except Exception as e:
                log.error(f"{traceback.format_exc()}")
                log.error(f"Unable to kill transcode session process {transcode_session.process_id}")
            try:
                if transcode_session.transcode_directory:
                    shutil.rmtree(transcode_session.transcode_directory,ignore_errors=True)
            except Exception as e:
                log.error(f"{traceback.format_exc()}")
                log.error(f"Unable to remove transcode session directory {transcode_session.transcode_directory}")
            db.op.delete_transcode_session(transcode_session_id=transcode_session.id)
        except Exception as e:
            log.error(f"{traceback.format_exc()}")
            log.error(f"Unable to close transcode session {transcode_session.id}")

    def cleanup(self):
        self.refresh_known_processes()
        transcode_sessions = db.op.get_transcode_session_list()
        if transcode_sessions and len(transcode_sessions) > 0:
            log.info(f"Cleaning up {len(transcode_sessions)} transcode child processes")
            for transcode_session in transcode_sessions:
                self.close(transcode_session=transcode_session)
        db.op.delete_all_transcode_sessions()
        shutil.rmtree(config.transcode_log_dir,ignore_errors=True)
        os.makedirs(config.transcode_log_dir)

transcode_sessions = TranscodeSessions()
