from settings import config
from log import log
import json
import util
import copy
import os
import datetime

def transcode_command(
    input_url:str,
    stream_port:int,
    audio_track_index:int=None,
    subtitle_track_index:int=None
):
    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream.flv'
    command =  f'ffmpeg  -i "{input_url}"'
    if config.transcode_dialect == 'nvidia':
        command += f' -c:v h264_nvenc -cq 25'
    elif config.transcode_dialect == 'quicksync':
        command += f' -c:v h264_qsv -global_quality 25 -look_ahead 1'
    command += f' -filter_complex "format=yuv420p;'
    if subtitle_track_index != None:
        command += f'subtitles=\'{input_url}\':si={subtitle_track_index}'
        # TODO Apply client-side subtitle style changes to the burn in subtitles
        command += f":force_style='FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&HA0000000,BorderStyle=4,Fontsize=18'\""
    command += f' -c:a aac'
    if audio_track_index != None:
        command += f' -map 0:v:0'
        command += f' -map 0:a:{audio_track_index}'
    command += f' -f flv -listen 1'
    command += f' "{streaming_url}"'
    log.info(command)
    return command,streaming_url

def path_to_info_json(media_path: str):
    probe = get_snowstream_info(media_path)
    pruned = json.dumps(probe['snowstream_info'])
    full = json.dumps(probe['ffprobe_raw'])
    info = json.dumps(info)
    return {
        'mediainfo': info,
        'ffprobe_full': full,
        'ffprobe_pruned': pruned
    }

class MediaTrack:
    def __init__(self, ffprobe:dict, mediainfo:dict):
        self.track_index = int(mediainfo['StreamOrder'])
        self.codec = mediainfo(['CodecID'])

        if ffprobe['codec_type'] == 'video':
            self.read_video(ffprobe,mediainfo)
        elif ffprobe['codec_type'] == 'audio':
            self.read_audio(ffprobe,mediainfo)
        elif ffprobe['codec_type'] == 'subtitle':
            self.read_subtitle(ffprobe,mediainfo)

        self.codec = None
        self.subtitle_index = None
        self.video_index = None
        self.audio_index = None
        self.resolution_height = None
        self.resolution_width = None
        self.megabits_per_second = None
        self.title = None
        self.display = None
        self.is_forced = None
        self.is_default = None
        self.is_closed_caption = None

    def read_video(self,ffprobe,mediainfo):
        self.kind = 'video'
        self.video_index = 0
        if '@typeorder' in mediainfo:
            self.video_index = int(mediainfo['@typeorder'])

    def read_audio(self,ffprobe,mediainfo):
        self.kind = 'audio'
        self.audio_index = 0
        if '@typeorder' in mediainfo:
            self.audio_index = int(mediainfo['@typeorder'])

    def read_subtitle(self,ffprobe,mediainfo):
        self.kind = 'subtitle'
        self.subtitle_index = 0
        if '@typeorder' in mediainfo:
            self.subtitle_index = int(mediainfo['@typeorder'])

def get_snowstream_info(media_path:str):
    command = f'ffprobe -hide_banner -loglevel quiet "{media_path}" -print_format json -show_format -show_streams'
    #log.info(command)
    command_output = util.run_cli(command,raw_output=True)
    ffprobe_output = command_output['stdout']
    cleaned = ffprobe_output.replace("�",'')
    raw_ffprobe = json.loads(cleaned)

    command = f'mediainfo --Output=JSON "{media_path}"'
    command_output = util.run_cli(command,raw_output=True)
    mediainfo_output = command_output['stdout']
    raw_mediainfo = json.loads(mediainfo_output)

    snowstream_info = {
        'duration_seconds': float(raw_ffprobe['format']['duration']),
        'is_hdr': 'HDR Format' in mediainfo_output,
        'tracks': []
    }

    for ii in range(0,len(raw_ffprobe['streams'])):
        ff = raw_ffprobe['streams'][ii]
        mi = raw_mediainfo['media']['track'][ii+1]
        track = MediaTrack(ffprobe=ff,mediainfo=mi)
        snowstream_info['tracks'].append(track)

    for stream in raw_ffprobe['streams']:
        if stream['codec_type'] == 'video':
            snowstream_info['resolution_width'] = int(stream['width'])
            snowstream_info['resolution_height'] = int(stream['height'])
            if 'tags' in stream and 'BPS-eng' in stream['tags']:
                entry['megabits_per_second'] = float(stream['tags']['BPS-eng']) / 1000.0
        if stream['codec_type'] == 'audio':
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
                entry['display'] += f" - {entry['language']}"
            if 'tags' in stream and 'title' in stream['tags']:
                entry['display'] += f" - {stream['tags']['title']}"
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
        if stream['codec_type'] == 'subtitle':
            entry['display'] = ''
            if 'codec_name' in stream:
                entry['display'] = f"{stream['codec_name']}"
            entry['title'] = ''
            if 'tags' in stream and 'title' in stream['tags']:
                 entry['display'] += f" - {stream['tags']['title']}"
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

    snowstream_info['inspection'] = inspect_media(media_path=media_path,ffprobe=snowstream_info)
    result = {
        'ffprobe_raw': raw_ffprobe,
        'snowstream_info': snowstream_info,
        'raw_mediainfo': raw_mediainfo
    }
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