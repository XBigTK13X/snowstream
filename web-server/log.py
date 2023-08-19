import sys
from settings import config
import logging as log
log.basicConfig(filename=config.log_file_path, encoding='utf-8', level=log.INFO)
log.getLogger().addHandler(log.StreamHandler(sys.stdout))
