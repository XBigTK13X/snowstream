from log import log
from settings import config
config.transcode_dialect = 'quicksync'
import snow_media.transcode_cli
from db import db
import json

# Super Mario Bros
MOVIE_HDR_TEN_PLUS=db.op.get_movie_by_id(ticket=db.Ticket(),movie_id=928)
# Sonic 3
MOVIE_DOLBY_VISION=db.op.get_movie_by_id(ticket=db.Ticket(),movie_id=780)
# Star Twinkle Precure Episode 9
EPISODE_H264_TEN=db.op.get_show_episode_by_id(ticket=db.Ticket(),episode_id=33536)

DEFAULT_PORT="11960"

def show_command(name:str, source, device:str=None,subtitle_index:int=None,audio_index:int=None):
    video_file = source.video_files[0]
    log.info('')
    log.info(name)
    log.info('')
    command,stream_url = snow_media.transcode_cli.build_command(
        device_profile="NVIDIA Shield" if not device else device,
        input_url=video_file.local_path,
        stream_port=DEFAULT_PORT,
        snowstream_info=json.loads(video_file.snowstream_info_json),
        subtitle_track_index=subtitle_index,
        audio_track_index=audio_index
    )
    log.info('')
    log.info(stream_url)

def quicksync_hdr10plus_browser():
    show_command('quicksync_hdr10plus_browser', MOVIE_HDR_TEN_PLUS, 'Web Browser')

def quicksync_hdr10plus():
    show_command('quicksync_hdr10plus', MOVIE_HDR_TEN_PLUS)

def quicksync_dolbyvision():
    show_command('quicksync_dolbyvision', MOVIE_DOLBY_VISION)

def quicksync_h264_10bit():
    show_command('quicksync_h254_10bit', EPISODE_H264_TEN)

def quicksync_h264_10bit_subtitles():
    show_command('quicksync_h264_10bit_subtitles', EPISODE_H264_TEN, subtitle_index=0)


#quicksync_hdr10plus_browser()
quicksync_hdr10plus()
#quicksync_dolbyvision()
#quicksync_h264_10bit()
#quicksync_h264_10bit_subtitles()