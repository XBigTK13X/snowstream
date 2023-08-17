class Config:
    def __init__(self):
        self.postgres_username = "snowstream"
        self.postgres_password = "snowstream"
        self.postgres_host = "localhost"
        self.postgres_port = 9060
        self.postgres_database = "snowstream"
        self.postgres_url = f"postgresql://{self.postgres_username}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"

config = Config()

# TODO Read overrides from env vars