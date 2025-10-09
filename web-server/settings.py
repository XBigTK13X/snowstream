import os
import sys


class Config:
    def __init__(self):
        self.server_version = "1.2.2"
        self.server_build_date = "October 08, 2025"
        self.server_build_dev_number = 1
        self.app_data_dir = '.snowstream/'
        self.display_config = None

        self.cached_text_ttl_seconds = 60 * 60 * 24 # One day
        self.ffmpeg_screencap_percent_location = 0.15
        self.frontend_url = "http://localhost:3000"
        self.is_deployed_environment = None
        self.jwt_algorithm = "HS256"
        self.jwt_expire_unit = "days"
        self.jwt_expire_value = 30
        self.jwt_secret_hex = "0" * 32
        self.tail_log_paths = [
            '.snowstream/log/worker.log',
            '.snowstream/log/server.log'
        ]
        self.log_level = "INFO"
        self.mediainfo_parse_speed = 0 # Most modern videos work with 0, which is MUCH faster
                                       # 1 is used to support very old videos, like DLed flvs
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
        self.search_results_per_shelf_limit = 200
        self.supervisor_password = "snowstream"
        self.supervisor_url = "http://localhost:9065"
        self.supervisor_username = "snowstream"
        self.themoviedb_api_key = None
        self.thetvdb_api_key = None
        self.thumbnail_dimensions = "340x500"
        self.transcode_create_max_wait_seconds = 10
        self.transcode_dialect = 'default'
        self.transcode_disconnect_seconds = 60
        self.transcode_port_range = "11910-11950"
        self.transcode_stream_host = '0.0.0.0'
        self.transcode_ffmpeg_host = '0.0.0.0'
        self.watch_progress_unwatched_threshold = 0.05
        self.watch_progress_watched_threshold = 0.90
        self.web_api_url = "http://localhost:8000"
        self.web_media_url = "<need_to_set_an_env_var-SNOWSTREAM_WEB_MEDIA_URL>"

        self.refresh_postgres_url()
        self.refresh_app_data_dirs()

    def refresh_postgres_url(self):
        self.postgres_url = f"postgresql://{self.postgres_username}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"

    def refresh_app_data_dirs(self):
        self.thumbnail_dir = f"{self.app_data_dir}thumbnail"
        self.ffprobe_dir = f"{self.app_data_dir}ffprobe"
        self.log_file_path = f"{self.app_data_dir}log/snowstream.log"
        self.transcode_log_dir = f"{self.app_data_dir}log/transcode/"

    def validate(self, log):
        if not self.web_media_url or 'SNOWSTREAM_WEB_MEDIA_URL' in self.web_media_url:
            log.error("SNOWSTREAM_WEB_MEDIA_URL environment variable must be set.")
            log.error("example: http://<host-ip>:9064/mnt")
            log.error("Exiting")
            sys.exit(1)
        if self.display_config:
            self.display(log)

    def display(self, log):
        log.info("Current server config")
        for key, val in vars(self).items():
            log.info(f"\t{key} = {val}")


config = Config()

for key, val in vars(config).items():
    env_var_key = f"SNOWSTREAM_{key.upper()}"
    env_var_value = os.environ.get(env_var_key)
    if env_var_value:
        setattr(config, key, env_var_value)


config.refresh_postgres_url()
config.refresh_app_data_dirs()

if config.is_deployed_environment:
    config.tail_log_paths = [
        '/app/logs/web-server-out.log',
        '/app/logs/web-server-err.log',
        '/app/logs/worker-out.log',
        '/app/logs/worker-err.log'
    ]

if not os.path.exists(config.thumbnail_dir):
    os.makedirs(config.thumbnail_dir, exist_ok=True)
if not os.path.exists(config.transcode_log_dir):
    os.makedirs(config.transcode_log_dir, exist_ok=True)