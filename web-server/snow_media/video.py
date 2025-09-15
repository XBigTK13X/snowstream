import util
from log import log
import json
from settings import config

def fail_track_parse(exception, media_path, ffprobe=None, mediainfo=None):
    log.error(f"An error occurred while reading track info for [{media_path}]")
    if ffprobe:
        log.error(json.dumps(ffprobe, indent=4))
    if mediainfo:
        log.error(json.dumps(mediainfo, indent=4))
    raise exception

class MediaTrack:
    # mediainfo index is 1 based
    # ffprobe index is 0 based
    # mpv uses ffprobe index scheme
    def __init__(self, media_path: str, ffprobe:dict, mediainfo:dict, is_anime:bool=False):
        try:
            self.kind = None
            self.track_index = 0
            if 'StreamOrder' in mediainfo:
                self.track_index = int(mediainfo['StreamOrder'])
            elif 'index' in ffprobe:
                self.track_index = int(ffprobe['index'])
            self.codec = mediainfo['CodecID']
            self.format = mediainfo['Format']
            if 'StreamSize' in mediainfo:
                self.bit_size = int(mediainfo['StreamSize'])
            if 'BitRate' in mediainfo:
                if '/' in mediainfo['BitRate']:
                    self.bit_rate = int(mediainfo['BitRate'].split('/')[0])
                else:
                    self.bit_rate = int(mediainfo['BitRate'])
            if 'BitRate_Mode' in mediainfo:
                self.bit_rate_kind = mediainfo['BitRate_Mode']
            self.language = mediainfo['Language'] if 'Language' in mediainfo else None
            self.is_default = mediainfo['Default'] == 'Yes' if 'Default' in mediainfo else False
            self.title = f"{mediainfo['Title']}" if 'Title' in mediainfo else ''

            if ffprobe['codec_type'] == 'video':
                self.read_video(ffprobe, mediainfo)
            elif ffprobe['codec_type'] == 'audio':
                self.read_audio(ffprobe, mediainfo, is_anime)
            elif ffprobe['codec_type'] == 'subtitle':
                self.read_subtitle(ffprobe, mediainfo, is_anime)
        except Exception as e:
            fail_track_parse(e,media_path,ffprobe,mediainfo)

    def read_video(self,ffprobe,mediainfo):
        self.kind = 'video'
        self.video_index = 0
        if '@typeorder' in mediainfo:
            self.video_index = int(mediainfo['@typeorder'])-1
        self.resolution_width = int(mediainfo['Width'])
        self.resolution_height = int(mediainfo['Height'])
        self.is_hdr = 'HDR_Format' in mediainfo
        if self.is_hdr:
            self.hdr_format = mediainfo['HDR_Format']
            self.hdr_compatibility = mediainfo['HDR_Format_Compatibility']
        if 'BitDepth' in mediainfo:
            self.bit_depth = mediainfo['BitDepth']
        if "Format_Profile" in mediainfo:
            self.format_profile = mediainfo['Format_Profile']
        if "Format_Level" in mediainfo:
            self.format_level = mediainfo['Format_Level']
        if "Format_Tier" in mediainfo:
            self.format_tier = mediainfo['Format_Tier']

    def score_audio_track(self, ffprobe, mediainfo, is_anime):
        if self.language:
            if self.language and 'en' in self.language.lower():
                if 'truehd' in ffprobe['codec_name']:
                    return 2100
                return 2050
            if self.language == 'ja':
                return 3000 if is_anime else 1000
        return 0

    def read_audio(self, ffprobe, mediainfo, is_anime):
        self.kind = 'audio'
        self.audio_index = 0
        if '@typeorder' in mediainfo:
            self.audio_index = int(mediainfo['@typeorder'])-1
        if 'Format_Commercial_IfAny' in mediainfo:
            self.format_full = mediainfo['Format_Commercial_IfAny']
        if 'Channels' in mediainfo:
            self.channel_count = int(mediainfo['Channels'])
        if 'Compression_Mode' in mediainfo:
            self.is_lossless = mediainfo['Compression_Mode'] == 'Lossless'
        self.score = self.score_audio_track(ffprobe, mediainfo, is_anime)

    def score_subtitle_track(self, ffprobe, mediainfo, is_anime):
        if self.language and 'en' in self.language.lower():
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
        if self.language == None:
            if self.is_forced:
                return 2020
            return 2050
        return 0

    def read_subtitle(self, ffprobe, mediainfo, is_anime):
        self.kind = 'subtitle'
        self.subtitle_index = 0
        if '@typeorder' in mediainfo:
            self.subtitle_index = int(mediainfo['@typeorder'])-1
        self.is_forced = mediainfo['Forced'] == 'Yes' if 'Forced' in mediainfo else False
        self.is_captioned = False
        low_title = self.title.lower()
        if ('disposition' in ffprobe and ffprobe['disposition']['captions'] == '1') \
            or 'cc' in low_title  \
            or 'caption' in low_title:
            self.is_captioned = True
        self.is_text = True
        low_format = mediainfo['Format'].lower()
        if 'pgs' in low_format or 'vob' in low_format:
            self.is_text = False
        self.score = self.score_subtitle_track(ffprobe, mediainfo, is_anime)

RESOLUTION_HEIGHTS = {
    2160: 'UHD 2160',
    1080: 'FHD 1080',
    720: 'HD 720',
    480: 'SD 480'
}

RESOLUTION_WIDTHS = {
    3840: 'UHD 2160',
    1920: 'FHD 1080',
    1280: 'HD 720',
    640: 'SD 480'
}


def path_to_info_json(media_path: str, ffprobe_json:str = None, mediainfo_json:str=None):
    probe = get_snowstream_info(
        media_path,
        ffprobe_existing=ffprobe_json,
        mediainfo_existing=mediainfo_json
    )
    return {
        'mediainfo_raw': json.dumps(probe['mediainfo_raw']),
        'ffprobe_raw': json.dumps(probe['ffprobe_raw']),
        'snowstream_info': json.dumps(probe['snowstream_info'])
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

    raw_mediainfo = None
    if mediainfo_existing:
        raw_mediainfo = json.loads(mediainfo_existing)
    else:
        command = f'mediainfo --ParseSpeed={config.mediainfo_parse_speed} --Output=JSON "{media_path}"'
        #log.info(command)
        command_output = util.run_cli(command,raw_output=True)
        mediainfo_output = command_output['stdout']
        raw_mediainfo = json.loads(mediainfo_output)

    snowstream_info = {
        'duration_seconds': float(raw_ffprobe['format']['duration']),
        'is_hdr': False,
        'is_anime': True if '/anime/' in media_path else False,
        'source_kind': 'remux' if 'remux' in media_path.lower() else 'transcode',
        'bit_rate': None,
        'bit_rate_kind': None,
        'bit_file_size': None,
        'tracks': {
            'audio': [],
            'video': [],
            'subtitle': []
        }
    }

    if 'OverallBitRate' in raw_mediainfo['media']['track'][0]:
        snowstream_info['bit_rate'] = int(raw_mediainfo['media']['track'][0]['OverallBitRate'])
        if 'OverallBitRate_Mode' in raw_mediainfo['media']['track'][0]:
            snowstream_info['bit_rate_kind'] = raw_mediainfo['media']['track'][0]['OverallBitRate_Mode']
    if 'FileSize' in raw_mediainfo['media']['track'][0]:
        snowstream_info['bit_file_size'] = int(raw_mediainfo['media']['track'][0]['FileSize'])

    stream_lookup = {}
    stream_keys = []

    ff_index = {
        'audio_index': 0,
        'video_index': 0,
        'subtitle_index': 0
    }
    valid_ffs = ['audio','video','subtitle']
    for ff in raw_ffprobe['streams']:
        try:
            if not ff['codec_type'] in valid_ffs:
                continue
            kind = ff['codec_type']
            key_pool = f'{kind}_index'
            stream_key = f'{kind}-{ff_index[key_pool]}'
            ff_index[key_pool] += 1
            if not stream_key in stream_lookup:
                stream_keys.append(stream_key)
                stream_lookup[stream_key] = {
                    'ffprobe': ff,
                    'track_index': int(ff['index'])
                }
        except Exception as e:
            fail_track_parse(e,media_path,ff)

    mi_index = {
        'audio_index': 0,
        'video_index': 0,
        'subtitle_index': 0
    }
    valid_mis = ['Audio','Video','Text']
    for mi in raw_mediainfo['media']['track']:
        try:
            if not mi['@type'] in valid_mis:
                continue
            kind = mi['@type'].lower()
            if kind == 'text':
                kind = 'subtitle'
            key_pool = kind + '_index'
            stream_key = f'{kind}-{mi_index[key_pool]}'
            mi_index[key_pool] += 1
            if not stream_key in stream_keys:
                stream_keys.append(stream_key)
            if not stream_key in stream_lookup:
                stream_lookup[stream_key] = {'track_index': stream_key}
            stream_lookup[stream_key]['mediainfo'] = mi
        except Exception as e:
            fail_track_parse(e,media_path,None,mi)

    for sk in stream_keys:
        stream = None
        try:
            stream = stream_lookup[sk]
            track = MediaTrack(
                media_path=media_path,
                ffprobe=stream['ffprobe'],
                mediainfo=stream['mediainfo'],
                is_anime=snowstream_info['is_anime']
            )
            if track.kind == None:
                continue
            if track.kind == 'video':
                if track.is_hdr:
                    snowstream_info['is_hdr'] = True
                snowstream_info['resolution_name'] = 'Unknown'
                if track.resolution_height in RESOLUTION_HEIGHTS:
                    snowstream_info['resolution_name'] = RESOLUTION_HEIGHTS[track.resolution_height]
                if snowstream_info['resolution_name'] == 'Unknown':
                    if track.resolution_width in RESOLUTION_WIDTHS:
                        snowstream_info['resolution_name'] = RESOLUTION_WIDTHS[track.resolution_width]

            snowstream_info['tracks'][track.kind].append(track.__dict__)
        except Exception as e:
            log.error(f'stream key error {sk}')
            log.error(json.dumps(stream, indent=4))
            fail_track_parse(
                exception=e,
                media_path=media_path,
                ffprobe=stream['ffprobe'] if 'ffprobe' in stream else None,
                mediainfo=stream['mediainfo'] if 'mediainfo' in stream else None
            )

    for kind in ['audio','subtitle']:
        if snowstream_info['tracks'][kind]:
            snowstream_info['tracks'][kind].sort(key=lambda xx: xx['score'],reverse=True)

    result = {
        'snowstream_info': snowstream_info,
        'ffprobe_raw': raw_ffprobe,
        'mediainfo_raw': raw_mediainfo
    }
    return result

def scrub_container_info(local_path:str):
    command = f'mkvpropedit "{local_path}" --edit info --set title=""'
    util.run_cli(command,raw_output=True)
    return True