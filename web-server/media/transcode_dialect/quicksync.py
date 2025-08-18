def encode_h264(video_filter_kind:str):
    return f' -c:v h264_qsv -global_quality 25 -look_ahead 1'

def decode_h264():
    return None

def encode_h265(video_filter_kind:str):
    return f' -c:v hevc_qsv'

def decode_h265():
    return None

def encode_vp9(video_filter_kind:str):
    return f' -c:v vp9_qsv'

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