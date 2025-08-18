import sys
from settings import config
import logging as log
import pprint

LOG_FORMAT = "%(asctime)s %(levelname)-8s %(message)s"
TIME_FORMAT = "%Y-%m-%d %H:%M:%S"
log.basicConfig(
    filename=config.log_file_path,
    encoding="utf-8",
    level=log.INFO,
    format=LOG_FORMAT,
    datefmt=TIME_FORMAT,
)
stream_logger = log.StreamHandler(sys.stdout)
stream_logger.setFormatter(log.Formatter(LOG_FORMAT, TIME_FORMAT))
log.getLogger().addHandler(stream_logger)
log.getLogger("pika").setLevel(log.ERROR)
log.pretty = pprint.pprint