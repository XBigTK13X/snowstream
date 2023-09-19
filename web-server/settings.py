import os


class Config:
    def __init__(self):
        self.server_version = "1.0.1"
        self.server_build_date = "September 18, 2023"
        self.frontend_url = "http://localhost:3000"
        self.web_api_url = ""
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
        self.log_level = 'INFO'
        self.log_file_path = '../logs/snowstream.log'
        self.go2rtc_url = "http://localhost:9066"
        self.supervisor_username = "snowstream"
        self.supervisor_password = "snowstream"
        self.supervisor_url = "http://localhost:9065"
        self.refresh_postgres_url()

    def refresh_postgres_url(self):
        self.postgres_url = f"postgresql://{self.postgres_username}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"


config = Config()

for key, val in vars(config).items():
    env_var_key = f'SNOWSTREAM_{key.upper()}'
    env_var_value = os.environ.get(env_var_key)
    if env_var_value:
        setattr(config, key, env_var_value)
        if 'POSTGRES' in env_var_key:
            config.refresh_postgres_url()
