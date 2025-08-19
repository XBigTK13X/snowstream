import media.filter_kind

def encode(codec:str):
    if codec == 'vp9':
        return f' -c:v libvpx-vp9'
    elif codec == 'opus':
        return f' -c:a libopus'
    elif codec == 'aac':
        return f' -c:a aac'
    return None

def before_encode_filter(kind:str):
    return None

after_strip_hdr10_plus = ''.join([
    '-x265-params "',
    'colorprim=bt2020',
    ':transfer=smpte2084',
    ':colormatrix=bt2020nc',
    ':hdr-opt=1',
    ':repeat-headers=1',
    ':master-display=G(8500,39850)B(6550,2300)R(15500,5000)WP(31270,32900)L(1000,400)',
    ':max-cll=1000,400"'
])

def after_encode_filter(kind:str):
    if kind == media.filter_kind.hdr_ten_plus_to_hdr_ten:
        return after_strip_hdr10_plus
    elif kind == media.filter_kind.ten_bit_to_eight_bit:
        return f'format=yuv420p'


# TODO Apply client-side subtitle style changes to the burned in subtitles
def text_subtitle_filter(input_url:str,subtitle_track_index:int):
    command =  f'subtitles=\'{input_url}\':si={subtitle_track_index}'
    command += f":force_style='"
    command += f"FontName=Arial,"
    command += f"PrimaryColour=&H00FFFFFF,"
    command += f"OutlineColour=&H00000000,"
    command += f"BackColour=&HA0000000,"
    command += f"BorderStyle=4,"
    command += f"Fontsize=24'"
    return command

def image_subtitle_filter():
    return f"[0:s:0]overlay"