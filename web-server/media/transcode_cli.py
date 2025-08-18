from settings import config
from log import log
import media.device
import media.transcode_dialect.default
import media.transcode_dialect.nvidia
import media.transcode_dialect.quicksync
import media.transcode_dialect.vaapi

# Working qsv
# ffmpeg -i "$VIDEO_PATH" -c:v hevc_qsv -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"

# Working vaapi


transcode_dialects = {
    'default': media.transcode_dialect.default,
    'nvidia': media.transcode_dialect.nvidia,
    'quicksync': media.transcode_dialect.quicksync,
    'vaapi': media.transcode_dialect.vaapi,
}

def build_command(
    device_profile:str,
    input_url:str,
    stream_port:int,
    snowstream_info:dict=None,
    audio_track_index:int=None,
    subtitle_track_index:int=None,
    seek_to_seconds:int=None
):
    dialects = []
    if config.transcode_dialect:
        dialects.append(transcode_dialects[config.transcode_dialect])
    dialects.append(transcode_dialects['default'])

    if device_profile == 'undefined':
        device_profile = media.device.default_device
    client_device = media.device.device_lookup[device_profile]

    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream.{client_device.transcode.container}'
    ffmpeg_url = f'http://{config.transcode_ffmpeg_host}:{stream_port}/stream.{client_device.transcode.container}'
    command =  f'ffmpeg'
    command += f' -i "{input_url}"'

    # -ss after the input is slower, but more compatible
    if seek_to_seconds:
        command += f' -ss {seek_to_seconds}'

    video_out = '[0:v:0]'
    video_filter_kind = None
    if snowstream_info and 'tracks' in snowstream_info and 'video' in snowstream_info['tracks']:
        video_track = snowstream_info['tracks']['video'][0]
        if 'hdr_compatibility' in video_track:
            hdr_kind = video_track['hdr_compatibility'].lower()
            if '10+' in hdr_kind and not client_device.video.hdr.ten_plus:
                video_filter_kind = '10plus-to-hdr10'
        if 'hdr_format' in video_track:
            hdr_kind = video_track['hdr_format'].lower()
            if 'dolby vision' in hdr_kind and not client_device.video.hdr.dolby_vision:
                video_filter_kind = 'dolbyvision-to-hdr10'
    if video_filter_kind:
        video_out = '[v]'

    encode_video_codec = client_device.transcode.video_codec
    found_match = False
    for dd in dialects:
        video_options = None
        if encode_video_codec == 'h265':
            video_options = dd.encode_h265(video_filter_kind)
        elif encode_video_codec == 'h264' and (not video_filter_kind or not 'hdr10' in video_filter_kind):
            video_options = dd.encode_h264(video_filter_kind)
        elif encode_video_codec == 'vp9':
            video_options = dd.encode_vp9(video_filter_kind)
        if video_options:
            command += video_options
            found_match = True
            break
    if not found_match:
        raise Exception(f"Unable to handle transcode video codec {encode_video_codec} for dialect {config.transcode_dialect} for {client_device.name}")

    # This subtitles filter for text based subs is PART of the filter_complex
    valid_sub_index = True
    if subtitle_track_index != None:
        sub_is_text = True
        if snowstream_info:
            if subtitle_track_index < len(snowstream_info['tracks']['subtitle']):
                valid_sub_index = False
            sub_track = snowstream_info['tracks']['subtitle'][subtitle_track_index]
            sub_is_text = sub_track['is_text']
        if valid_sub_index:
            if sub_is_text:
                command += f';[v]subtitles=\'{input_url}\':si={subtitle_track_index}'
                # TODO Apply client-side subtitle style changes to the burned in subtitles
                command += f":force_style='"
                command += f"FontName=Arial,"
                command += f"PrimaryColour=&H00FFFFFF,"
                command += f"OutlineColour=&H00000000,"
                command += f"BackColour=&HA0000000,"
                command += f"BorderStyle=4,"
                command += f"Fontsize=18'[outv];"
                video_out = '[outv]'
            else:
                command += f";[v][0:s:0]overlay;"
    command += f"\" -map '{video_out}'"

    if config.transcode_max_rate:
        # Cap the video output bitrate
        # EX: tmr - 5M
        command += f' -b:v {config.transcode_max_rate} -maxrate {config.transcode_max_rate}'

    found_match = False
    encode_audio_codec = client_device.transcode.audio_codec
    for dd in dialects:
        audio_options = None
        if encode_audio_codec == 'aac':
            audio_options = dd.encode_aac()
        elif encode_audio_codec == 'opus':
            audio_options = dd.encode_opus()
        if audio_options:
            command += audio_options
            found_match = True
            break
    if not found_match:
        raise Exception(f"Unable to handle transcode audio codec {encode_audio_codec} for dialect {config.transcode_dialect} for {client_device.name}")
    if audio_track_index != None:
        command += f' -map 0:a:{audio_track_index}'

    command += f' -f {client_device.transcode.container} -listen 1'
    command += f' "{ffmpeg_url}"'
    log.info(command)
    return command,streaming_url