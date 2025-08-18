from log import log
from settings import config
config.transcode_dialect = 'quicksync'
import media.transcode_cli
from db import db
import json

# Super Mario Bros
MOVIE_HDR_TEN_PLUS=db.op.get_movie_by_id(ticket=db.Ticket(),movie_id=928).video_files[0]
TESTING_DEVICE="NVIDIA Shield"
DEFAULT_PORT="11960"

def quicksync_hdr10plus_shield():
    log.info('quicksync_hdr10plus_shield')
    command,stream_url = media.transcode_cli.build_command(
        device_profile=TESTING_DEVICE,
        input_url=MOVIE_HDR_TEN_PLUS.local_path,
        stream_port=DEFAULT_PORT,
        snowstream_info=json.loads(MOVIE_HDR_TEN_PLUS.snowstream_info_json)
    )
    log.info('')
    log.info(stream_url)

def quicksync_hdr10plus_browser():
    log.info('quicksync_hdr10plus_browser')
    command,stream_url = media.transcode_cli.build_command(
        device_profile="Web Browser",
        input_url=MOVIE_HDR_TEN_PLUS.local_path,
        stream_port=DEFAULT_PORT,
        snowstream_info=json.loads(MOVIE_HDR_TEN_PLUS.snowstream_info_json)
    )
    log.info('')
    log.info(stream_url)

quicksync_hdr10plus_shield()