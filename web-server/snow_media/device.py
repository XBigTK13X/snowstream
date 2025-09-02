class Stub:
    def __init__(self):
        pass

class DeviceProfile:
    def __init__(self,config):
        self.name = config['name']
        self.force_player = config.get('force_player')
        self.require_password = config.get('require_password', True)

        self.video = Stub()
        self.video.resolution = Stub()
        self.video.resolution.width = config.get('video_width')
        self.video.resolution.height = config.get('video_height')

        self.transcode = Stub()
        self.transcode.container = config.get('transcode_container','matroska')
        self.transcode.video_codec = config.get('transcode_video_codec', 'h265')
        self.transcode.audio_codec = config.get('transcode_audio_codec', 'aac')
        self.transcode.hdr_container = config.get('transcode_hdr_container', 'matroska')
        self.transcode.bit_rate = config.get('transcode_bit_rate')

        self.video.h264 = Stub()
        self.video.h264.eight = config.get('h264_eight')
        self.video.h264.ten = config.get('h264_ten')

        self.video.h265 = Stub()
        self.video.h265.eight = config.get('h265_eight')
        self.video.h265.ten = config.get('h265_ten')

        self.video.av1 = config.get('av1')
        self.video.vp9 = config.get('vp9')

        self.video.hdr = Stub()
        self.video.hdr.basic = config.get('hdr')
        self.video.hdr.hlg = config.get('hdr_hlg')
        self.video.hdr.ten = config.get('hdr_ten')
        self.video.hdr.dolby_vision = config.get('dolby_vision')
        self.video.hdr.ten_plus = config.get('hdr_ten_plus')

        self.audio = Stub()
        self.audio.dts = Stub()
        self.audio.dts.x = config.get('dts_x')
        self.audio.dts.hd = config.get('dts_hd')
        self.audio.dolby = Stub()
        self.audio.dolby.atmos = config.get('dolby_atmos')
        self.audio.dolby.hd = config.get('dolby_hd')

device_list = [
    DeviceProfile({
        'name': 'CCwGTV4K',
        'hdr': 'hard',
        'hdr_ten': 'hard',
        'hdr_ten_plus': 'hard',
        'hdr_hlg': 'hard',
        'dolby_vision': 'hard',
        'h265_eight': 'hard',
        'h265_ten': 'hard',
        'h264_eight': 'hard',
        'transcode_bit_rate': '15M'
    }),
    DeviceProfile({
        'name': 'NVIDIA Shield',
        'hdr': 'hard',
        'hdr_ten': 'hard',
        'dolby_vision': 'hard',
        'h264_eight': 'hard',
        'h264_ten': 'soft',
        'h265_eight': 'hard',
        'h265_ten': 'hard',
        'vp9': 'hard',
        'dts_x': 'hard',
        'dts_hd': 'hard',
        'dolby_atmos': 'hard',
        'dolby_hd': 'hard',
        'require_password': False
    }),
    DeviceProfile({
        'name': 'Google Streamer',
        'hdr': 'hard',
        'hdr_ten': 'hard',
        'hdr_ten_plus': 'hard',
        'dolby_vision': 'hard',
        'h264_eight': 'hard',
        'h264_eight': 'hard',
        'h264_ten': 'hard',
        'vp9': 'hard',
        'av1': 'hard',
        'transcode_bit_rate': '15M'
    }),
    DeviceProfile({
        'force_player': 'exo',
        'name': 'Web Browser',
        'h264_eight': 'hard',
        'h264_ten': 'hard',
        'h265_eight': 'hard',
        'h265_ten': 'hard',
        'av1': 'hard',
        'vp9': 'hard',
        'transcode_container': 'webm',
        'transcode_video_codec': 'vp9',
        'transcode_audio_codec': 'opus'
    }),
    DeviceProfile({
        'name': 'Fire Max 11',
        'h264_eight': 'hard',
        'h264_ten': 'hard',
        'h264_eight': 'hard',
        'h264_ten': 'hard',
    })
]

default_device = 'CCwGTV4K'
device_lookup = {}
for device in device_list:
    device_lookup[device.name] = device

def get_device(profile_name:str):
    if not profile_name or not profile_name in device_lookup:
        return device_lookup[default_device]
    return device_lookup[profile_name]