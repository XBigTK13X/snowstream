import media.filter_kind

def encode(codec:str):
    if codec == 'h265':
        return f' -c:v hevc_qsv'
    elif codec == 'h264':
        return f' -c:v h264_qsv -global_quality 25 -look_ahead 1'
    elif codec == 'vp9':
        return f' -c:v vp9_qsv'
    return None

before_strip_hdr_ten_plus = ''.join([
    'hwupload=extra_hw_frames=64',
    ',tonemap_qsv=curve=linear',
    ':format=p010le',
    ',hwdownload',
    ',setparams=color_primaries=bt2020',
    ':color_trc=smpte2084',
    ':colorspace=bt2020nc',
])
def before_encode_filter(kind:str):
    if kind == media.filter_kind.hdr_ten_plus_to_hdr_ten:
        return before_strip_hdr_ten_plus
    return None


def after_encode_filter(kind:str):
    return None
