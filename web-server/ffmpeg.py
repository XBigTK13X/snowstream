from settings import config
from log import log
import json
import util
import copy
import os
import datetime

def transcode_command(input_url:str, stream_port:int, audio_track_index:int, subtitle_track_index:int):
    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream'
    command =  f'ffmpeg  -i "{input_url}"'
    command += f' -c:v av1_nvenc'
    if subtitle_track_index:
        command += f' -vf "subtitles=\'{input_url}\':si={subtitle_track_index}"'
    command += f' -c:a libvorbis'
    if audio_track_index:
        command += f' -map 0:v:0'
        command += f' -map 0:a:{audio_track_index}'
    command += f' -f webm -listen 1'
    command += f' "{streaming_url}"'
    log.info(command)
    return command,streaming_url


def ffprobe_media(media_path:str):
    hash_name = util.string_to_md5(media_path)
    output_dir = os.path.join(config.ffprobe_dir,hash_name[0],hash_name[1])
    if not os.path.exists(output_dir):
        os.makedirs(output_dir,exist_ok=True)
    output_path = os.path.join(output_dir,hash_name+'.json')
    if os.path.exists(output_path):
        with open(output_path,'r') as read_handle:
            return json.loads(read_handle.read())
    command = f'ffprobe -hide_banner -loglevel quiet "{media_path}" -print_format json -show_format -show_streams'
    #log.info(command)
    command_output = util.run_cli(command,raw_output=True)
    ffprobe_output = command_output['stdout']
    cleaned = ffprobe_output.replace("�",'')
    raw_ffprobe = json.loads(cleaned)
    parsed = {'video':[],'audio':[],'subtitle':[],'other':[]}
    parsed['duration_seconds'] = float(raw_ffprobe['format']['duration'])
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
            parsed['resolution_width'] = int(stream['width'])
            parsed['resolution_height'] = int(stream['height'])
            if 'tags' in stream and 'BPS-eng' in stream['tags']:
                entry['megabits_per_second'] = float(stream['tags']['BPS-eng']) / 1000.0
            parsed['video'].append(entry)
            video_index += 1
        if stream['codec_type'] == 'audio':
            entry['relative_index'] = audio_index
            entry['display'] = f"{stream['channels']} ch"
            if 'codec_name' in stream and stream['codec_name']:
                 entry['display'] += f' - {stream["codec_name"]}'
            entry['title'] = ''
            entry['kind'] = 'audio'
            if 'tags' in stream and 'language' in stream['tags'] and stream['tags']['language'] != '':
                entry['language'] = stream['tags']['language']
                entry['display'] += f" - {entry['language']}"
            else:
                entry['language'] = '???'
                entry['display'] += f' - {entry['language']}'
            if 'tags' in stream and 'title' in stream['tags']:
                entry['display'] += f' - {stream['tags']['title']}'
                entry['title'] = stream['tags']['title']
            entry['is_forced'] = False
            entry['is_default'] = False
            entry['is_closed_caption'] = False
            if 'tags' in stream and 'BPS-eng' in stream['tags']:
                entry['megabits_per_second'] = float(stream['tags']['BPS-eng']) / 1000.0
            if 'disposition' in stream:
                entry['is_forced'] = stream['disposition']['forced'] == '1' or 'force' in entry['title'].lower()
                entry['is_default'] = stream['disposition']['default'] == '1' or 'default' in entry['title'].lower()
                entry['is_closed_caption'] = stream['disposition']['captions'] == '1' or 'cc' in entry['title'].lower()  or 'caption' in entry['title'].lower()
            parsed['audio'].append(entry)
            audio_index += 1
        if stream['codec_type'] == 'subtitle':
            entry['relative_index'] = subtitle_index
            entry['display'] = ''
            if 'codec_name' in stream:
                entry['display'] = f"{stream['codec_name']}"
            entry['title'] = ''
            if 'tags' in stream and 'title' in stream['tags']:
                 entry['display'] += f' - {stream['tags']['title']}'
                 entry['title'] = stream['tags']['title']
            entry['kind'] = 'subtitle'
            if 'pgs' in entry['display'].lower():
                entry['display'] = 'pgs'
            if 'tags' in stream and 'language' in stream['tags']:
                entry['language'] = stream['tags']['language']
                if 'HANDLER_NAME' in stream['tags']:
                    entry['display'] = f"{stream['tags']['HANDLER_NAME']} - {entry['display']}"
                else:
                    entry['display'] = f"{stream['tags']['language']} - {entry['display']}"
            entry['is_forced'] = False
            entry['is_default'] = False
            entry['is_closed_caption'] = False
            if 'disposition' in stream:
                entry['is_forced'] = stream['disposition']['forced'] == '1' or 'force' in entry['title'].lower()
                entry['is_default'] = stream['disposition']['default'] == '1' or 'default' in entry['title'].lower()
                entry['is_closed_caption'] = stream['disposition']['captions'] == '1' or 'cc' in entry['title'].lower()  or 'caption' in entry['title'].lower()
            parsed['subtitle'].append(entry)
            subtitle_index += 1
        absolute_index += 1

    parsed['inspection'] = inspect_media(media_path=media_path,ffprobe=parsed)
    result = {
        'ffprobe_raw': raw_ffprobe,
        'parsed': parsed,
    }
    with open(output_path,'w') as write_handle:
        write_handle.write(json.dumps(result, indent=4))
    return result

def score_audio_track(track):
    if 'language' in track:
        if 'eng' in track['language']:
            if 'truehd' in track['display']:
                return 2100
            return 2050
        if 'jap' in track['language'] or 'jpn' in track['language']:
            return 1000
    return 0


def score_subtitle_track(track):
    if 'language' in track:
        if 'eng' in track['language']:
            if 'pgs' in track['display'].lower():
                return 2040
            if 'sdh' in track['display'].lower():
                return 2060
            if track['is_forced'] or track['is_default']:
                return 2070
            if track['is_closed_caption']:
                return 2080
            if 'convert' in track['display'].lower():
                return 2015
            if 'clean' in track['display'].lower():
                return 2030
            return 2100
        if 'und' in track['language']:
            if track['is_forced']:
                return 2020
            return 2050
    return 0


# Originally from snowby
# https://github.com/XBigTK13X/snowby/blob/acb151d05f60c77845b3b1e5ba2417f97a7acff2/desktop/media/inspector.js
# https://github.com/XBigTK13X/snowby/blob/acb151d05f60c77845b3b1e5ba2417f97a7acff2/common/jellyfin-item.js
def inspect_media(media_path:str, ffprobe:dict):
    result = {}
    result['is_anime'] = True if '/anime/' in media_path else False
    result['source_kind'] = 'transcode'
    if 'Remux' in media_path:
        result['source_kind'] = 'remux'

    if ffprobe['resolution_height'] == 2160:
        result['resolution_name'] = 'UHD 2160'
    elif ffprobe['resolution_height'] == 1080:
        result['resolution_name'] = 'FHD 1080'
    elif ffprobe['resolution_height'] == 720:
        result['resolution_name'] = 'HD 720'
    elif ffprobe['resolution_height'] == 480:
        result['resolution_name'] = 'SD 480'
    else:
        result['resolution_name'] = 'Unknown'

    result['is_hdr'] = False
    if 'color_space' in ffprobe['video'][0] and '2020' in ffprobe['video'][0]['color_space']:
        result['is_hdr'] = True

    result['scored_tracks'] = {'audio':[],'subtitle':[]}

    for track in ffprobe['audio']:
        score = score_audio_track(track)
        if score > 0:
            track_copy = copy.deepcopy(track)
            if result['is_anime']:
                score += 2000
            track_copy['score'] = score
            result['scored_tracks']['audio'].append(track_copy)
    # This will only happen if the inspector doesn't understand what the audio tracks are
    # Usually only the case for really old files
    if len(result['scored_tracks']['audio']) == 0:
        result['scored_tracks']['audio'] = ffprobe['audio']
    else:
        result['scored_tracks']['audio'] = sorted(result['scored_tracks']['audio'],key=lambda xx:xx['score'])

    for track in ffprobe['subtitle']:
        score = score_subtitle_track(track)
        if score > 0:
            track_copy = copy.deepcopy(track)
            track_copy['score'] = score
            result['scored_tracks']['subtitle'].append(track_copy)

    # This will only happen if the inspector doesn't understand what the subtitle tracks are
    # Usually only the case for really old files
    if len(result['scored_tracks']['subtitle']) == 0:
        result['scored_tracks']['subtitle'] = ffprobe['subtitle']
    else:
        result['scored_tracks']['subtitle'] = sorted(result['scored_tracks']['subtitle'],key=lambda xx:xx['score'])

    return result

def extract_screencap(video_path:str, duration_seconds:int, output_path:str):
    seconds = config.ffmpeg_screencap_percent_location * duration_seconds
    timestamp = f'{datetime.timedelta(seconds=seconds)}'
    command = f'ffmpeg -ss {timestamp} -i "{video_path}" -frames:v 1 -q:v 2 "{output_path}"'
    util.run_cli(command,raw_output=True)
    return output_path