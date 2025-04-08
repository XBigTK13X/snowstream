from settings import config
from log import log
import json
import util

def transcode_command(input_url, stream_port):
    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream'
    command =  f'ffmpeg  -i "{input_url}"'
    command += f' -c:v av1_nvenc'
    command += f' -c:a libvorbis'
    command += f' -f webm -listen 1'
    command += f' "{streaming_url}"'
    log.info(command)
    return command,streaming_url

# TODO port some of the inspector logic from Snowby into here
# That will filter out unwanted tracks and help guess the best default track

def ffprobe_media(media_path):
    command = f'ffprobe -hide_banner "{media_path}" -print_format json -show_format -show_streams'
    command_output = util.run_cli(command,raw_output=True)
    raw_ffprobe = json.loads(command_output['stdout'])
    parsed = {'video':[],'audio':[],'subtitle':[],'other':[]}
    audio_index = 0
    video_index = 0
    subtitle_index = 0
    absolute_index = 0
    for stream in raw_ffprobe['streams']:
        entry = {
            'absolute_index': absolute_index,            
        }
        if 'codec_name' in stream:
            entry['codec'] = stream['codec_name']
        if stream['codec_type'] == 'video':
            entry['relative_index'] = video_index
            entry['kind'] = 'video'
            parsed['video'].append(entry)            
            video_index += 1
        if stream['codec_type'] == 'audio':
            entry['relative_index'] = audio_index
            entry['display'] = f"{stream['channels']} ch - {stream["codec_name"]}"
            entry['kind'] = 'audio'
            if 'tags' in stream and 'language' in stream['tags']:
                entry['language'] = stream['tags']['language']
                entry['display'] = f"{entry['language']} - {entry['display']}"
            parsed['audio'].append(entry)
            audio_index += 1
        if stream['codec_type'] == 'subtitle':
            entry['relative_index'] = subtitle_index
            entry['display'] = f"{stream['codec_name']}"
            entry['kind'] = 'subtitle'
            if 'pgs' in entry['display'].lower():
                entry['display'] = 'pgs'
            if 'tags' in stream and 'language' in stream['tags']:
                entry['language'] = stream['tags']['language']                
                if 'HANDLER_NAME' in stream['tags']:
                    entry['display'] = f"{stream['tags']['HANDLER_NAME']} - {entry['display']}"
                else:
                    entry['display'] = f"{stream['tags']['language']} - {entry['display']}"
            parsed['subtitle'].append(entry)
            subtitle_index += 1
        absolute_index += 1

    return {
        'raw':raw_ffprobe,
        'parsed': parsed
    }