def ten_to_eight_bit():
    return f' -filter_complex "[0:v]format=yuv420p[v]'

def encode_h264(video_filter_kind:str):
    if video_filter_kind == 'tenbit-to-eightbit':
        return ten_to_eight_bit()
    return None

def decode_h264():
    return None

def encode_h265(video_filter_kind:str):
    if video_filter_kind == 'tenbit-to-eightbit':
        return ten_to_eight_bit()
    return None

def decode_h265():
    return None

def encode_vp9(video_filter_kind:str):
    return f' -c:v libvpx-vp9'

def decode_vp9():
    return None

def encode_aac():
    return f' -c:a aac'

def encode_opus():
    return f' -c:a libopus'

def decode_aac():
    return None

def decode_opus():
    return None