from snow_media.transcode_dialect.default import DefaultTranscodeDialect


# Kind of working HDR10+ tone mapping
# ffmpeg -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "$VIDEO_PATH"
# -c:v hevc_vaapi -g 60 -b:v 15M -profile:v main10 -pix_fmt p010le -color_primaries bt2020 -color_trc smpte2084 -colorspace bt2020nc -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"

class VaapiTranscodeDialect(DefaultTranscodeDialect):
    def __init__(self,video_filter_kind:str):
        super().__init__(video_filter_kind=video_filter_kind,name='vaapi')