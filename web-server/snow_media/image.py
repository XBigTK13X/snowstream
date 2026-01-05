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
    safe_output_path = util.safe_media_path(output_path)
    if not force_overwrite and os.path.exists(safe_output_path):
        return output_path

    # ImageMagick chokes on large GIF
    # GIF is treated like an image by snowstream
    # But the thumbnail generator needs to treat it like a video
    if local_path.lower().endswith(".gif"):
        return extract_screencap(local_path, duration_seconds=0, output_path=output_path)

    safe_input_path = util.safe_media_path(local_path)

    command = f"convert {safe_input_path} -resize {config.thumbnail_dimensions} {safe_output_path}"
    util.run_cli(command)
    return output_path

def extract_screencap(video_path:str, duration_seconds:int, output_path:str):
    safe_input_path = util.safe_media_path(video_path)
    safe_output_path = util.safe_media_path(output_path)
    seconds = config.ffmpeg_screencap_percent_location * duration_seconds
    timestamp = f'{datetime.timedelta(seconds=seconds)}'
    command = f"ffmpeg -ss {timestamp} -i {safe_input_path} -frames:v 1 -q:v 2 {safe_output_path}"
    util.run_cli(command,raw_output=True)
    return output_path