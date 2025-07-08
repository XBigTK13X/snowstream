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

class MediaTrack:
    # mediainfo index is 1 based
    # ffprobe index is 0 based
    # mpv uses ffprobe index scheme
    def __init__(self, ffprobe:dict, mediainfo:dict):
        self.track_index = int(mediainfo['StreamOrder'])
        self.codec = mediainfo(['CodecID'])
        self.format = mediainfo(['Format'])
        self.size_bits = int(mediainfo['BitRate'])
        self.language = mediainfo['Language'] if 'Language' in mediainfo else 'Undefined'
        self.is_default = mediainfo['Default'] == 'Yes' if 'Default' in mediainfo else False
        self.title = mediainfo['Title'] if 'Title' in mediainfo else None

        if ffprobe['codec_type'] == 'video':
            self.read_video(ffprobe,mediainfo)
        elif ffprobe['codec_type'] == 'audio':
            self.read_audio(ffprobe,mediainfo)
        elif ffprobe['codec_type'] == 'subtitle':
            self.read_subtitle(ffprobe,mediainfo)

    def read_video(self,ffprobe,mediainfo):
        self.kind = 'video'
        self.video_index = 0
        if '@typeorder' in mediainfo:
            self.video_index = int(mediainfo['@typeorder'])-1
        self.resolution_width = int(mediainfo['Width'])
        self.resolution_height = int(mediainfo['Height'])
        self.is_hdr = 'HDR Format' in mediainfo

    def score_audio_track(self, ffprobe, mediainfo):
        if 'language' in ffprobe:
            if 'eng' in ffprobe['language']:
                if 'truehd' in mediainfo['CodecID'].lower():
                    return 2100
                return 2050
            if 'jap' in ffprobe['language'] or 'jpn' in ffprobe['language']:
                return 1000
        return 0

    def read_audio(self,ffprobe,mediainfo):
        self.kind = 'audio'
        self.audio_index = 0
        if '@typeorder' in mediainfo:
            self.audio_index = int(mediainfo['@typeorder'])-1
        self.title = mediainfo['Format_Commercial_IfAny']
        self.channel_count = int(mediainfo['Channels'])
        self.is_lossless = mediainfo['Compression_Mode'] == 'Lossless'
        self.score = self.score_audio_track(ffprobe,mediainfo)

    def score_subtitle_track(self, ffprobe, mediainfo):
        if 'language' in ffprobe:
            if 'eng' in ffprobe['language']:
                low_title = self.title.lower()
                if not self.is_text:
                    return 2040
                if 'sdh' in low_title:
                    return 2060
                if self.is_forced or self.is_default:
                    return 2070
                if self.is_captioned:
                    return 2080
                if 'convert' in low_title:
                    return 2015
                if 'clean' in low_title:
                    return 2030
                return 2100
            if 'und' in ffprobe['language']:
                if self.is_forced:
                    return 2020
                return 2050
        return 0

    def read_subtitle(self,ffprobe,mediainfo):
        self.kind = 'subtitle'
        self.subtitle_index = 0
        if '@typeorder' in mediainfo:
            self.subtitle_index = int(mediainfo['@typeorder'])-1
        self.is_forced = mediainfo['Forced'] == 'Yes' if 'Forced' in mediainfo else False
        self.is_captioned = False
        low_title = mediainfo['Title'].lower()
        if ('disposition' in ffprobe and ffprobe['disposition']['captions'] == '1') \
            or 'cc' in low_title  \
            or 'caption' in low_title:
            self.is_captioned = True
        self.is_text = True
        low_format = mediainfo['Format'].lower()
        if 'pgs' in low_format or 'vob' in low_format:
            self.is_text = False
        self.score = self.score_subtitle_track(ffprobe,mediainfo)

RESOLUTIONS = {
    2160: 'UHD 2160',
    1080: 'FHD 1080',
    720: 'HD 720',
    480: 'SD 480'
}


def path_to_info_json(media_path: str, ffprobe_json:str = None, mediainfo_json:str=None):
    probe = get_snowstream_info(media_path,ffprobe_existing=ffprobe_json,mediainfo_existing=mediainfo_json)
    pruned = json.dumps(probe['snowstream_info'])
    full = json.dumps(probe['ffprobe_raw'])
    info = json.dumps(info)
    return {
        'mediainfo': info,
        'ffprobe_full': full,
        'ffprobe_pruned': pruned
    }

# Originally from snowby
# https://github.com/XBigTK13X/snowby/blob/acb151d05f60c77845b3b1e5ba2417f97a7acff2/desktop/media/inspector.js
# https://github.com/XBigTK13X/snowby/blob/acb151d05f60c77845b3b1e5ba2417f97a7acff2/common/jellyfin-item.js
def get_snowstream_info(media_path:str,ffprobe_existing:str=None,mediainfo_existing:str=None):
    raw_ffprobe = None
    if ffprobe_existing:
        raw_ffprobe = json.loads(ffprobe_existing)
    else:
        command = f'ffprobe -hide_banner -loglevel quiet "{media_path}" -print_format json -show_format -show_streams'
        #log.info(command)
        command_output = util.run_cli(command,raw_output=True)
        ffprobe_output = command_output['stdout']
        cleaned_ffprobe = ffprobe_output.replace("�",'')
        raw_ffprobe = json.loads(cleaned_ffprobe)

    if mediainfo_existing:
        raw_mediainfo = json.loads(mediainfo_existing)
    command = f'mediainfo --Output=JSON "{media_path}"'
    command_output = util.run_cli(command,raw_output=True)
    mediainfo_output = command_output['stdout']
    raw_mediainfo = json.loads(mediainfo_output)

    snowstream_info = {
        'duration_seconds': float(raw_ffprobe['format']['duration']),
        'is_hdr': False,
        'is_anime': True if '/anime/' in media_path else False,
        'source_kind': 'remux' if 'remux' in media_path.lower() else 'transcode',
        'tracks': {
            'audio': [],
            'video': [],
            'subtitle': []
        }
    }

    for ii in range(0,len(raw_ffprobe['streams'])):
        ff = raw_ffprobe['streams'][ii]
        mi = raw_mediainfo['media']['track'][ii+1]
        track = MediaTrack(ffprobe=ff,mediainfo=mi)
        if not track.kind:
            continue
        if track.kind == 'video':
            if track.is_hdr:
                snowstream_info['is_hdr'] = True
            snowstream_info['resolution_name'] = RESOLUTIONS[track.resolution_height] if track.resolution_height in RESOLUTIONS else 'Unknown'
        snowstream_info['tracks'][track.kind].append(track)
    for kind in ['audio','subtitle']:
        if snowstream_info['tracks'][kind]:
            snowstream_info['tracks'][kind].sort(key=lambda xx: xx.score,reverse=True)

    result = {
        'snowstream_info': snowstream_info,
        'ffprobe_raw': raw_ffprobe,
        'raw_mediainfo': raw_mediainfo
    }
    return result


def extract_screencap(video_path:str, duration_seconds:int, output_path:str):
    seconds = config.ffmpeg_screencap_percent_location * duration_seconds
    timestamp = f'{datetime.timedelta(seconds=seconds)}'
    command = f'ffmpeg -ss {timestamp} -i "{video_path}" -frames:v 1 -q:v 2 "{output_path}"'
    util.run_cli(command,raw_output=True)
    return output_path