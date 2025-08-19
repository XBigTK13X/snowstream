def encode(codec:str):
    if codec == 'h264':
        return f' -c:v h264_nvenc -cq 25'
    return None

def before_encode_filter(kind:str):
    return None

def after_encode_filter(kind:str):
    return None