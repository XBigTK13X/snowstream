from snow_media.transcode_dialect.default import DefaultTranscodeDialect

class NvidiaTranscodeDialect(DefaultTranscodeDialect):
    def __init__(self,video_filter_kind:str):
        super().__init__(video_filter_kind=video_filter_kind,name='nvidia')

    def encode(self,codec:str):
        if codec == 'h264':
            return f'-c:v h264_nvenc -cq 25'
        return None