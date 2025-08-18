def encode_h264(video_filter_kind:str):
    return None

def decode_h264():
    return None

# Kind of working HDR10+ tone mapping
# ffmpeg -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "$VIDEO_PATH" -c:v hevc_vaapi -g 60 -b:v 15M -profile:v main10 -pix_fmt p010le -color_primaries bt2020 -color_trc smpte2084 -colorspace bt2020nc -f flv -listen 1 "http://0.0.0.0:11910/stream.flv"
def encode_h265(video_filter_kind:str):
    return None

def decode_h265():
    return None

def encode_vp9(video_filter_kind:str):
    return None

def decode_vp9():
    return None

def encode_aac():
    return None

def decode_aac():
    return None

def encode_opus():
    return None

def decode_opus():
    return None