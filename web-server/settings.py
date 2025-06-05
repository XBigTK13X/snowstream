import os
import sys


class Config:
    def __init__(self):
        self.server_version = "0.9.2"
        self.server_build_date = "May 29, 2025"

        self.cached_text_ttl_seconds = 60 * 60 * 24 # One day
        self.ffmpeg_screencap_percent_location = 0.15
        self.ffprobe_dir = ".snowstream/ffprobe"
        self.frontend_url = "http://localhost:3000"
        self.is_deployed_environment = None
        self.jwt_algorithm = "HS256"
        self.jwt_expire_unit = "days"
        self.jwt_expire_value = 30
        self.jwt_secret_hex = "0" * 32
        self.log_file_path = ".snowstream/log/snowstream.log"
        self.tail_log_paths = [
            '.snowstream/log/worker.log',
            '.snowstream/log/server.log'
        ]
        self.log_level = "INFO"
        self.postgres_database = "snowstream"
        self.postgres_host = "localhost"
        self.postgres_password = "snowstream"
        self.postgres_port = 9060
        self.postgres_username = "snowstream"
        self.rabbit_delay_seconds = 5
        self.rabbit_host = "localhost"
        self.rabbit_max_failures = 4
        self.rabbit_password = "snowstream"
        self.rabbit_port = "9062"
        self.rabbit_queue = "snowstream"
        self.rabbit_user = "snowstream"
        self.search_results_per_shelf_limit = 25
        self.supervisor_password = "snowstream"
        self.supervisor_url = "http://localhost:9065"
        self.supervisor_username = "snowstream"
        self.themoviedb_api_key = None
        self.thetvdb_api_key = None
        self.thumbnail_dimensions = "340x500"
        self.thumbnail_dir = ".snowstream/thumbnail"
        self.transcode_create_max_wait_seconds = 10
        self.transcode_dir = ".snowstream/cache-transcode"
        self.transcode_disconnect_seconds = 60
        self.transcode_log_dir = ".snowstream/log/transcode/"
        self.transcode_port_range = "11910-11950"
        self.transcode_stream_host = '0.0.0.0'
        self.transcode_video_codec = "h264_nvenc"
        self.watch_progress_unwatched_threshold = 0.05
        self.watch_progress_watched_threshold = 0.90
        self.web_api_url = "http://localhost:8000"
        self.web_media_url = "<need_to_set_an_env_var-SNOWSTREAM_WEB_MEDIA_URL>"

        self.refresh_postgres_url()

    def refresh_postgres_url(self):
        self.postgres_url = f"postgresql://{self.postgres_username}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"


config = Config()

for key, val in vars(config).items():
    env_var_key = f"SNOWSTREAM_{key.upper()}"
    env_var_value = os.environ.get(env_var_key)
    if env_var_value:
        setattr(config, key, env_var_value)
        if "POSTGRES" in env_var_key:
            config.refresh_postgres_url()

if config.is_deployed_environment:
    config.tail_log_paths = [
        '/app/logs/web-server-out.log',
        '/app/logs/web-server-err.log',
        '/app/logs/worker-out.log',
        '/app/logs/worker-err.log'
    ]

if not config.web_media_url or 'SNOWSTREAM_WEB_MEDIA_URL' in config.web_media_url:
    print("SNOWSTREAM_WEB_MEDIA_URL environment variable must be set.")
    print("example: http://<host-ip>:9064/mnt")
    print("Exiting")
    sys.exit(1)

if not os.path.exists(config.thumbnail_dir):
    os.makedirs(config.thumbnail_dir, exist_ok=True)
if not os.path.exists(config.transcode_log_dir):
    os.makedirs(config.transcode_log_dir, exist_ok=True)
if not os.path.exists(config.transcode_dir):
    os.makedirs(config.transcode_dir, exist_ok=True)