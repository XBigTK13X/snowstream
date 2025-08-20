from settings import config
from log import log
import media.device
from media.transcode_dialect.default import DefaultTranscodeDialect
from media.transcode_dialect.nvidia import NvidiaTranscodeDialect
from media.transcode_dialect.quicksync import QuicksyncTranscodeDialect
from media.transcode_dialect.vaapi import VaapiTranscodeDialect
import media.filter_kind

# Working qsv
# ffmpeg -i "$VIDEO_PATH" -c:v hevc_qsv -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"

# Working vaapi


transcode_dialects = {
    'default': media.transcode_dialect.default,
    'nvidia': media.transcode_dialect.nvidia,
    'quicksync': media.transcode_dialect.quicksync,
    'vaapi': media.transcode_dialect.vaapi,
}

class FfmpegCommand:
    def __init__(self):
        self.command = 'ffmpeg'

    def append(self, instruction):
        self.command += f' {instruction}'

    def get_command(self):
        return self.command

def build_command(
    device_profile:str,
    input_url:str,
    stream_port:int,
    snowstream_info:dict=None,
    audio_track_index:int=None,
    subtitle_track_index:int=None,
    seek_to_seconds:int=None
):
    if device_profile == 'undefined':
        device_profile = media.device.default_device
    client_device = media.device.device_lookup[device_profile]

    container = client_device.transcode.container
    # Help dialect determine what extra actions need to be taken to transcode
    video_filter_kind = None
    if snowstream_info and 'tracks' in snowstream_info and 'video' in snowstream_info['tracks']:
        video_track = snowstream_info['tracks']['video'][0]
        if 'hdr_format' in video_track:
            container = client_device.transcode.hdr_container
        if 'hdr_compatibility' in video_track:
            hdr_kind = video_track['hdr_compatibility'].lower()
            if '10+' in hdr_kind and not client_device.video.hdr.ten_plus:
                video_filter_kind = media.filter_kind.hdr_ten_plus_to_hdr_ten
        elif 'hdr_format' in video_track:
            hdr_kind = video_track['hdr_format'].lower()
            if 'dolby vision' in hdr_kind and not client_device.video.hdr.dolby_vision:
                video_filter_kind = media.filter_kind.dolby_vision_to_hdr_ten

    dialect = DefaultTranscodeDialect(video_filter_kind=video_filter_kind)
    if config.transcode_dialect:
        if config.transcode_dialect == 'quicksync':
            dialect = QuicksyncTranscodeDialect(video_filter_kind=video_filter_kind)
        elif config.transcode_dialect == 'vaapi':
            dialect = VaapiTranscodeDialect(video_filter_kind=video_filter_kind)
        elif config.transcode_dialect == 'nvidia':
            dialect = NvidiaTranscodeDialect(video_filter_kind=video_filter_kind)

    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream.{container}'
    ffmpeg_url = f'http://{config.transcode_ffmpeg_host}:{stream_port}/stream.{container}'
    command =  FfmpegCommand()

    # Apply any dialect input settings
    before_input = dialect.before_input()
    if before_input:
        command.append(before_input)

    command.append(f'-i "{input_url}"')

    # -ss after the input is slower, but more compatible
    if seek_to_seconds:
        command.append(f'-ss {seek_to_seconds}')

    if video_filter_kind:
        before_filter = dialect.before_encode_filter()
        if before_filter:
            command.append(f'-filter_complex "{before_filter};"')

    encode_video_codec = client_device.transcode.video_codec
    found_match = False
    video_encode = dialect.encode(encode_video_codec)
    if video_encode:
        command.append(video_encode)
        found_match = True
    if not found_match:
        raise Exception(f"Unable to handle transcode video codec {encode_video_codec} for dialect {config.transcode_dialect} for {client_device.name}")

    complex_filters = []
    if video_filter_kind:
        after_filter = dialect.after_encode_filter()
        if after_filter:
            complex_filters.append(after_filter)

    # The subtitle filters are part of the 'after' video filter_complex above
    subtitle_filter = None
    valid_sub_index = True
    if subtitle_track_index != None:
        sub_is_text = True
        if snowstream_info:
            if subtitle_track_index >= len(snowstream_info['tracks']['subtitle']):
                valid_sub_index = False
            sub_track = snowstream_info['tracks']['subtitle'][subtitle_track_index]
            sub_is_text = sub_track['is_text']
        if valid_sub_index:
            if sub_is_text:
                subtitle_filter = dialect.text_subtitle_filter(input_url,subtitle_track_index)
                complex_filters.append(subtitle_filter)
            else:
                subtitle_filter  = dialect.image_subtitle_filter()
                complex_filters.append(subtitle_filter)

    if complex_filters:
        filters = ';'.join(complex_filters)
        command.append(f' -filter_complex "{filters};"')

    # Sometimes specific non-filter instructions are needed
    if video_filter_kind:
        after_params = dialect.after_encode_parameters()
        if after_params:
            command.append(after_params)

    # Cap the video output bitrate
    # EX: transcode_max_rate = 15M
    if config.transcode_max_rate:
        command.append(f'-b:v {config.transcode_max_rate} -maxrate {config.transcode_max_rate}')

    found_match = False
    encode_audio_codec = client_device.transcode.audio_codec
    audio_options = dialect.encode(encode_audio_codec)
    if audio_options:
        command.append(audio_options)
        found_match = True
    if not found_match:
        raise Exception(f"Unable to handle transcode audio codec {encode_audio_codec} for dialect {config.transcode_dialect} for {client_device.name}")

    if audio_track_index != None:
        command.append(f'-map 0:a:{audio_track_index}')

    command.append(f'-f {container} -listen 1')
    command.append(f'"{ffmpeg_url}"')
    log.info(command.get_command())
    return command.get_command(),streaming_url