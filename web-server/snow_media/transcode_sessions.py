from log import log
import atexit
import snow_media.transcode_cli
import json
import os
import shutil
import signal
import threading
import time
import traceback
import util

from db import db
from database import db_models as dm
from settings import config


class TranscodeSessions:
    def __init__(self):
        parts = config.transcode_port_range.split("-")
        self.port_start = int(parts[0])
        self.port_end = int(parts[1])
        self.pid_is_ffmpeg = {}
        self._lock = threading.RLock()
        self._disconnect_timers = {}

    def get_unused_port(self):
        open_port = self.port_start
        transcode_sessions = db.op.get_transcode_session_list()
        used_ports = [xx.stream_port for xx in transcode_sessions]
        if len(used_ports) >= self.port_end - self.port_start:
            return None
        while open_port in used_ports:
            open_port += 1
        return open_port

    def register_cleanup(self):
        atexit.register(self.cleanup)

    def _kill_process(self, pid: int):
        if not pid:
            return
        try:
            os.killpg(pid, signal.SIGTERM)
        except ProcessLookupError:
            return
        except PermissionError:
            try:
                os.kill(pid, signal.SIGTERM)
            except ProcessLookupError:
                return
        for ii in range(10):
            try:
                os.kill(pid, 0)
            except ProcessLookupError:
                return
            time.sleep(0.1)
        try:
            os.killpg(pid, signal.SIGKILL)
        except ProcessLookupError:
            return
        except PermissionError:
            try:
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                return

    def prune_dead_sessions(self):
        with self._lock:
            self.refresh_known_processes()
            for session in db.op.get_transcode_session_list():
                if not self.process_is_running(session):
                    if session.transcode_directory:
                        shutil.rmtree(session.transcode_directory, ignore_errors=True)
                    db.op.delete_transcode_session(transcode_session_id=session.id)

    def create_session(
        self,
        ticket: db.Ticket,
        player_kind: str,
        device_profile: str = None,
        video_file_id: int = None,
        streamable_id: int = None,
        audio_track_index: int = None,
        subtitle_track_index: int = None,
        seek_to_seconds: int = None,
    ):
        with self._lock:
            existing_sessions = db.op.get_transcode_sessions_by_cduid(cduid=ticket.cduid)
            for existing in existing_sessions:
                self.close(transcode_session=existing)

            self.prune_dead_sessions()

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
            if stream_port is None:
                raise Exception("No unused transcode ports available")

            transcode_session = db.op.create_transcode_session(
                cduid=ticket.cduid,
                video_file_id=video_file_id,
                streamable_id=streamable_id,
                stream_port=stream_port,
            )
            try:
                command, streaming_url = snow_media.transcode_cli.build_command(
                    device_profile=device_profile,
                    input_url=input_path,
                    snowstream_info=snowstream_info,
                    stream_port=stream_port,
                    player_kind=player_kind,
                    audio_track_index=audio_track_index,
                    subtitle_track_index=subtitle_track_index,
                    seek_to_seconds=seek_to_seconds,
                )
                client_device = ticket.client.client_device.reported_name
                log_name = f"{transcode_session.id}-{client_device}-"
                if video_file_id:
                    log_name += f"v-{video_file_id}"
                elif streamable_id:
                    log_name += f"s-{streamable_id}"
                log_name += ".log"
                log_path = os.path.join(config.transcode_log_dir, log_name)
                log.info("Logging to " + log_path)
                transcode_process = util.run_cli(command, background=True, log_path=log_path)
                db.op.set_transcode_process_id(
                    transcode_session_id=transcode_session.id, process_id=transcode_process.pid
                )
            except Exception:
                self.close(transcode_session_id=transcode_session.id)
                raise

        time.sleep(5)

        if player_kind == "exo":
            streaming_url = f"{config.web_api_url}/api/transcode/stream?transcode_session_id={transcode_session.id}"

        return {
            "transcode_url": streaming_url,
            "transcode_session_id": transcode_session.id,
        }

    def get_playlist_content(self, transcode_session_id: int):
        transcode_session = db.op.get_transcode_session_by_id(
            transcode_session_id=transcode_session_id
        )
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
        transcode_session = db.op.get_transcode_session_by_id(
            transcode_session_id=transcode_session_id
        )
        if not transcode_session:
            return None
        binary_data = None
        segment_path = os.path.join(transcode_session.transcode_directory, segment_file)
        max_wait_seconds = config.transcode_create_max_wait_seconds
        while not os.path.exists(segment_path) and max_wait_seconds > 0:
            time.sleep(1)
            max_wait_seconds -= 1
        with open(segment_path, "rb") as read_handle:
            binary_data = read_handle.read()
        self.close_on_disconnect(transcode_session=transcode_session)
        return binary_data

    def refresh_known_processes(self):
        self.pid_is_ffmpeg = {}
        result = util.run_cli("jc -p ps aux", raw_output=True)
        if result.get("error"):
            return
        processes = json.loads(result["stdout"])
        for process in processes:
            if "ffmpeg" in process["command"]:
                self.pid_is_ffmpeg[process["pid"]] = process["command"]

    def close_on_disconnect(self, transcode_session: dm.TranscodeSession):
        if not transcode_session:
            return
        session_id = transcode_session.id
        with self._lock:
            existing_timer = self._disconnect_timers.pop(session_id, None)
            if existing_timer:
                existing_timer.cancel()

            def disconnect_callback():
                with self._lock:
                    self._disconnect_timers.pop(session_id, None)
                self.close(transcode_session_id=session_id)

            timer = threading.Timer(
                config.transcode_disconnect_seconds, disconnect_callback
            )
            timer.daemon = True
            self._disconnect_timers[session_id] = timer
            timer.start()

    def process_is_running(self, transcode_session):
        if not transcode_session or not transcode_session.process_id:
            return False
        return (
            transcode_session.process_id in self.pid_is_ffmpeg
            and f"{transcode_session.stream_port}"
            in self.pid_is_ffmpeg[transcode_session.process_id]
        )

    def close(
        self,
        transcode_session: dm.TranscodeSession = None,
        transcode_session_id: int = None,
    ):
        with self._lock:
            try:
                if transcode_session_id is not None:
                    transcode_session = db.op.get_transcode_session_by_id(
                        transcode_session_id=transcode_session_id
                    )
                    if not transcode_session:
                        return True
                if not transcode_session:
                    return True
                existing_timer = self._disconnect_timers.pop(transcode_session.id, None)
                if existing_timer:
                    existing_timer.cancel()
                self.refresh_known_processes()
                try:
                    if self.process_is_running(transcode_session):
                        self._kill_process(transcode_session.process_id)
                except Exception:
                    log.error(f"{traceback.format_exc()}")
                    log.error(
                        f"Unable to kill transcode session process {transcode_session.process_id}"
                    )
                try:
                    if transcode_session.transcode_directory:
                        shutil.rmtree(
                            transcode_session.transcode_directory, ignore_errors=True
                        )
                except Exception:
                    log.error(f"{traceback.format_exc()}")
                    log.error(
                        f"Unable to remove transcode session directory {transcode_session.transcode_directory}"
                    )
                db.op.delete_transcode_session(transcode_session_id=transcode_session.id)
            except Exception:
                log.error(f"{traceback.format_exc()}")
                session_label = transcode_session.id if transcode_session else transcode_session_id
                log.error(f"Unable to close transcode session {session_label}")

    def cleanup(self):
        with self._lock:
            for timer in self._disconnect_timers.values():
                timer.cancel()
            self._disconnect_timers.clear()
            self.refresh_known_processes()
            transcode_sessions = db.op.get_transcode_session_list()
            if transcode_sessions and len(transcode_sessions) > 0:
                log.info(f"Cleaning up {len(transcode_sessions)} transcode child processes")
                for transcode_session in transcode_sessions:
                    self.close(transcode_session=transcode_session)
            db.op.delete_all_transcode_sessions()
            shutil.rmtree(config.transcode_log_dir, ignore_errors=True)
            os.makedirs(config.transcode_log_dir, exist_ok=True)


transcode_sessions = TranscodeSessions()
