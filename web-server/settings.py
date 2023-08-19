import os


class Config:
    def __init__(self):
        self.postgres_username = "snowstream"
        self.postgres_password = "snowstream"
        self.postgres_host = "localhost"
        self.postgres_port = 9060
        self.postgres_database = "snowstream"
        self.postgres_url = f"postgresql://{self.postgres_username}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"
        self.rabbit_user = "snowstream"
        self.rabbit_password = "snowstream"
        self.rabbit_host = "localhost"
        self.rabbit_port = "9062"
        self.rabbit_queue = "snowstream"
        self.rabbit_max_failures = 4
        self.rabbit_delay_seconds = 5
        self.log_level = 'INFO'
        self.log_file_path = '../logs/snowstream.log'


config = Config()

for key, val in vars(config).items():
    env_var_key = f'SNOWSTREAM_{key.upper()}'
    env_var_value = os.environ.get(env_var_key)
    if env_var_value:
        config[key] = env_var_value
