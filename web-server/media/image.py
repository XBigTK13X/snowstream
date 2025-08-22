from settings import config
import os
import util
import datetime

def create_thumbnail(local_path:str,force_overwrite:bool=False):
    hash_name = util.string_to_md5(local_path)
    output_dir = os.path.join(config.thumbnail_dir,hash_name[0],hash_name[1])
    if not os.path.exists(output_dir):
        os.makedirs(output_dir,exist_ok=True)
    output_path = os.path.join(output_dir,hash_name+'.jpg')
    if not force_overwrite and os.path.exists(output_path):
        return output_path
    command = f'convert "{local_path}" -resize {config.thumbnail_dimensions} "{output_path}"'
    util.run_cli(command)
    return output_path

def extract_screencap(video_path:str, duration_seconds:int, output_path:str):
    seconds = config.ffmpeg_screencap_percent_location * duration_seconds
    timestamp = f'{datetime.timedelta(seconds=seconds)}'
    command = f'ffmpeg -ss {timestamp} -i "{video_path}" -frames:v 1 -q:v 2 "{output_path}"'
    util.run_cli(command,raw_output=True)
    return output_path