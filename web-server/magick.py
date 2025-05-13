from settings import config
from log import log
import os
import util

def create_thumbnail(local_path):
    hash_name = util.string_to_md5(local_path)
    output_dir = os.path.join(config.thumbnail_dir,hash_name[0],hash_name[1])
    if not os.path.exists(output_dir):
        os.makedirs(output_dir,exist_ok=True)
    output_path = os.path.join(output_dir,hash_name+'.jpg')
    if os.path.exists(output_path):
        return output_path
    command = f'convert "{local_path}" -resize {config.thumbnail_dimensions} "{output_path}"'
    util.run_cli(command)
    return output_path