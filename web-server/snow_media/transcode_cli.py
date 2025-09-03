from settings import config
from log import log
import snow_media.device
from snow_media.transcode_dialect.default import DefaultTranscodeDialect
from snow_media.transcode_dialect.nvidia import NvidiaTranscodeDialect
from snow_media.transcode_dialect.quicksync import QuicksyncTranscodeDialect
from snow_media.transcode_dialect.vaapi import VaapiTranscodeDialect
import snow_media.planner

# Working qsv
# ffmpeg -i "$VIDEO_PATH" -c:v hevc_qsv -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"

# Working vaapi


transcode_dialects = {
    'default': snow_media.transcode_dialect.default,
    'nvidia': snow_media.transcode_dialect.nvidia,
    'quicksync': snow_media.transcode_dialect.quicksync,
    'vaapi': snow_media.transcode_dialect.vaapi,
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

    plan = snow_media.planner.create_plan(device_profile=device_profile,snowstream_info=snowstream_info)

    dialect = DefaultTranscodeDialect(video_filter_kind=plan.video_filter_kind)
    if config.transcode_dialect:
        if config.transcode_dialect == 'quicksync':
            dialect = QuicksyncTranscodeDialect(video_filter_kind=plan.video_filter_kind)
        elif config.transcode_dialect == 'vaapi':
            dialect = VaapiTranscodeDialect(video_filter_kind=plan.video_filter_kind)
        elif config.transcode_dialect == 'nvidia':
            dialect = NvidiaTranscodeDialect(video_filter_kind=plan.video_filter_kind)

    streaming_url = f'http://{config.transcode_stream_host}:{stream_port}/stream.{plan.transcode_container}'
    ffmpeg_url = f'http://{config.transcode_ffmpeg_host}:{stream_port}/stream.{plan.transcode_container}'
    command =  FfmpegCommand()

    # Apply any dialect input settings
    before_input = dialect.before_input()
    if before_input:
        command.append(before_input)

    # -ss before the input is faster, but more sometimes fails on older files
    if seek_to_seconds:
        command.append(f'-ss {seek_to_seconds}')

    command.append(f'-i "{input_url}"')

    # -ss after the input is slower, but more compatible
    # It is slower to the point that on large 4k remuxes it isn't usable
    #if seek_to_seconds:
    #   command.append(f'-ss {seek_to_seconds}')

    has_complex_filters = False

    if plan.video_filter_kind:
        before_filter = dialect.before_encode_filter()
        if before_filter:
            has_complex_filters = True
            command.append(f'-filter_complex "{before_filter};"')

    encode_video_codec = plan.transcode_video_codec
    found_match = False
    video_encode = dialect.encode(encode_video_codec)
    if video_encode:
        command.append(video_encode)
        found_match = True
    if not found_match:
        raise Exception(f"Unable to handle transcode video codec {encode_video_codec} for dialect {config.transcode_dialect} for {device_profile}")

    complex_filters = []
    if plan.video_filter_kind:
        after_filter = dialect.after_encode_filter()
        if after_filter:
            complex_filters.append(after_filter)
            has_complex_filters = True

    # Subtitles take so long to process for a transcode that rnv player fails to connect
    # Might need a better solution to side-load the subs without ffmpeg needing to process them
    # The subtitle filters are part of the 'after' video filter_complex above
    # Note that only one filter_complex is allowed, so this logic needs to be tweaked so the resulting command is actually
    # ffmpeg -init_hw_device qsv=hw -filter_hw_device hw \
    # -i "movie.mkv" \
    # -filter_complex "[0:v]hwupload=extra_hw_frames=64,format=qsv,scale_qsv=format=p010,setparams=color_primaries=bt2020:color_trc=smpte2084:colorspace=bt2020nc,subtitles='movie.mkv':si=0:force_style='FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&HA0000000,BorderStyle=4,Fontsize=24'[v]" \
    # -map "[v]" -c:v hevc_qsv \
    # -map 0:a:0 -c:a aac \
    # -f matroska -listen 1 "http://0.0.0.0:11910/stream.matroska"
    #subtitle_filter = None
    #valid_sub_index = True
    #if subtitle_track_index != None:
    #    sub_is_text = True
    #    if snowstream_info:
    #        if subtitle_track_index >= len(snowstream_info['tracks']['subtitle']):
    #            valid_sub_index = False
    #        sub_track = snowstream_info['tracks']['subtitle'][subtitle_track_index]
    #        sub_is_text = sub_track['is_text']
    #    if valid_sub_index:
    #        if sub_is_text:
    #            subtitle_filter = dialect.text_subtitle_filter(input_url,subtitle_track_index)
    #            complex_filters.append(subtitle_filter)
    #        else:
    #            subtitle_filter  = dialect.image_subtitle_filter()
    #            complex_filters.append(subtitle_filter)


    if complex_filters:
        filters = ';'.join(complex_filters)
        command.append(f' -filter_complex "{filters};"')

    # Sometimes specific non-filter instructions are needed
    if plan.video_filter_kind:
        after_params = dialect.after_encode_parameters()
        if after_params:
            command.append(after_params)

    # Cap the video output bitrate
    # EX: transcode_max_rate = 15M
    if plan.transcode_bit_rate:
        command.append(f'-b:v {plan.transcode_bit_rate}')

    found_match = False
    encode_audio_codec = plan.transcode_audio_codec
    audio_options = dialect.encode(encode_audio_codec)
    if audio_options:
        command.append(audio_options)
        found_match = True
    if not found_match:
        raise Exception(f"Unable to handle transcode audio codec {encode_audio_codec} for dialect {config.transcode_dialect} for {device_profile}")

    # A complex filter automatically maps its output as the default video
    # Without one, the mapping needs to be explicit
    if not has_complex_filters:
        command.append(f'-map 0:v:0')

    if audio_track_index != None:
        command.append(f'-map 0:a:{audio_track_index}')

    command.append(f'-f {plan.transcode_container} -listen 1')
    command.append(f'"{ffmpeg_url}"')
    log.info(command.get_command())
    return command.get_command(),streaming_url