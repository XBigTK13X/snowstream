import snow_media.filter_kind
from snow_media.transcode_dialect.default import DefaultTranscodeDialect

class QuicksyncTranscodeDialect(DefaultTranscodeDialect):
    def __init__(self,video_filter_kind:str):
        super().__init__(video_filter_kind=video_filter_kind,name='quicksync')


    def before_input(self):
        return '-init_hw_device qsv=hw -filter_hw_device hw'

    def before_encode_filter(self):
        if self.video_filter_kind == snow_media.filter_kind.hdr_ten_plus_to_hdr_ten:
            return "hwupload=extra_hw_frames=64,format=qsv,scale_qsv=format=p010,setparams=color_primaries=bt2020:color_trc=smpte2084:colorspace=bt2020nc"
        return None

    def encode(self,codec:str):
        if codec == 'h265':
            return f'-c:v hevc_qsv'
        elif codec == 'h264':
            return f'-c:v h264_qsv -global_quality 25 -look_ahead 1'
        elif codec == 'vp9':
            return f'-c:v vp9_qsv'
        else:
            return super().encode(codec)

    def after_encode_parameters(self):
        return None