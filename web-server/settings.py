import os
import sys


class Config:
    def __init__(self):
        self.server_version = "0.5.7"
        self.server_build_date = "October 24, 2024"
        self.frontend_url = "http://localhost:3000"
        self.web_api_url = "http://localhost:8000"
        self.postgres_username = "snowstream"
        self.postgres_password = "snowstream"
        self.postgres_host = "localhost"
        self.postgres_port = 9060
        self.postgres_database = "snowstream"
        self.rabbit_user = "snowstream"
        self.rabbit_password = "snowstream"
        self.rabbit_host = "localhost"
        self.rabbit_port = "9062"
        self.rabbit_queue = "snowstream"
        self.rabbit_max_failures = 4
        self.rabbit_delay_seconds = 5
        self.log_level = "INFO"
        self.log_file_path = ".snowstream/log/snowstream.log"
        self.supervisor_username = "snowstream"
        self.supervisor_password = "snowstream"
        self.supervisor_url = "http://localhost:9065"
        self.transcode_dir = ".snowstream/cache-transcode"
        self.transcode_create_max_wait_seconds = 10
        self.transcode_disconnect_seconds = 60
        self.transcode_video_codec = "h264_nvenc"
        self.transcode_port_range = "11910-11950"
        self.transcode_stream_host = '0.0.0.0'
        self.transcode_log_dir = ".snowstream/log/transcode/"
        self.jwt_secret_hex = "0" * 32
        self.jwt_algorithm = "HS256"
        self.jwt_expire_value = 30
        self.jwt_expire_unit = "days"
        self.web_media_url = "<need_to_set_an_env_var-SNOWSTREAM_WEB_MEDIA_URL>"
        self.hot_reload_message_handlers = "yes"
        self.thetvdb_api_key = None
        self.watch_progress_unwatched_threshold = 0.05
        self.watch_progress_watched_threshold = 0.90
        self.cached_text_ttl_seconds = 60 * 60 * 24 # One day
        self.thumbnail_dir = ".snowstream/thumbnail"
        self.thumbnail_dimensions = "340x500"
        self.ffprobe_dir = ".snowstream/ffprobe"
        self.search_results_per_shelf_limit = 25

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