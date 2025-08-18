from settings import config
from log import log
from media import device

# Working qsv
# ffmpeg -i "$VIDEO_PATH" -c:v hevc_qsv -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"

# Working vaapi
# ffmpeg -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "$VIDEO_PATH" -c:v hevc_vaapi -g 60 -b:v 15M -profile:v main10 -pix_fmt p010le -color_primaries bt2020 -color_trc smpte2084 -colorspace bt2020nc -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"

def video_encoder(codec):
    if codec == 'h264':
        if config.transcode_dialect == 'nvidia':
            return f' -c:v h264_nvenc -cq 25'
        elif config.transcode_dialect == 'quicksync':
            return f' -c:v h264_qsv -global_quality 25 -look_ahead 1'
        elif config.transcode_dialect == 'vaapi':
            return f' '
    elif codec == 'vp9':
        if config.transcode_dialect == 'quicksync':
            return f' -c:v vp9_qsv'
        return f' -c:v libvpx-vp9'
    raise Exception(f"Unable to handle transcode video codec {codec} for dialect {config.transcode_dialect}")

def audio_encoder(codec):
    if codec == 'aac':
        return f' -c:a aac'
    elif codec == 'opus':
        return f' -c:a libopus'
    raise Exception(f"Unable to handle transcode audio codec {codec}")

def transcode_command(
    device_profile:str,
    input_url:str,
    snowstream_info:dict,
    stream_port:int,
    audio_track_index:int=None,
    subtitle_track_index:int=None,
    seek_to_seconds:int=None
):
    if device_profile == 'undefined':
        device_profile = 'CCwGTV4K'
    client = device.device_lookup[device_profile]
    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream.{client.transcode.container}'
    ffmpeg_url = f'http://{config.transcode_ffmpeg_host}:{stream_port}/stream.{client.transcode.container}'
    command =  f'ffmpeg'

    command += f' -i "{input_url}"'

    # -ss after the input is slower, but more compatible
    if seek_to_seconds:
        command += f' -ss {seek_to_seconds}'

    command += video_encoder(client.transcode.video_codec)

    # Force 8 bit color depth
    video_out = '[v]'
    command += f' -filter_complex "[0:v]format=yuv420p[v]'

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

    if config.transcode_max_rate and config.transcode_buffer_size:
        # Cap the video output bitrate
        # EX: tmr - 5M and tbr 3M
        command += f' -b:v {config.transcode_max_rate} -maxrate {config.transcode_max_rate} -bufsize {config.transcode_buffer_size}'

    command += audio_encoder(client.transcode.audio_codec)
    if audio_track_index != None:
        command += f' -map 0:a:{audio_track_index}'


    command += f' -f {client.transcode.container} -listen 1'
    command += f' "{ffmpeg_url}"'
    log.info(command)
    return command,streaming_url