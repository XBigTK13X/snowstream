import sys
import logging
from settings import config

LOG_FORMAT = "%(asctime)s %(levelname)-8s %(name)s: %(message)s"
TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

root = logging.getLogger()
root.handlers.clear()
root.setLevel(logging.INFO)

file_handler = logging.FileHandler(config.log_file_path, encoding="utf-8")
file_handler.setFormatter(logging.Formatter(LOG_FORMAT, TIME_FORMAT))
root.addHandler(file_handler)

stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(logging.Formatter(LOG_FORMAT, TIME_FORMAT))
root.addHandler(stream_handler)

def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    logging.getLogger().error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))

sys.excepthook = handle_exception

logging.getLogger("pika").setLevel(logging.ERROR)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("watchfiles.main").setLevel(logging.ERROR)

log = logging