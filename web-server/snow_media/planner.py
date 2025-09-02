import snow_media

# These plans have an impact on the client and server
# Client-side they can determine if exo/mpv should be used, and other similar actions
# Server-side they can force the transcode command builder to use different arguments

class PlaybackPlan:
    def __init__(self):
        self.player = 'mpv'
        self.transcode_container = None
        self.transcode_video_codec = None
        self.transcode_audio_codec = None
        self.transcode_bit_rate = None
        self.video_filter_kind = None
        self.video_requires_transcode = False
        self.audio_requires_transcode = {}
        self.hardware_acceleration = None
        

def create_plan(device_profile:str, snowstream_info:dict):
    device = snow_media.device.get_device(device_profile)
    plan = PlaybackPlan()
    plan.transcode_container = device.transcode.container
    plan.transcode_audio_codec = device.transcode.audio_codec
    plan.transcode_video_codec = device.transcode.video_codec
    if device.force_player:
        plan.player = device.force_player
    if device.transcode.bit_rate:
        plan.transcode_bit_rate = device.transcode.bit_rate
    if snowstream_info and 'tracks' in snowstream_info:
        if 'video' in snowstream_info['tracks']:
            video_track = snowstream_info['tracks']['video'][0]
            # TODO if soft codec supported, then disable hardware acceleration
            if 'hdr_format' in video_track:
                plan.transcode_container = device.transcode.hdr_container
                # mpv cannot passthrough HDR even when transcoded, exo can
                plan.player = 'exo'
            if 'hdr_compatibility' in video_track:
                hdr_kind = video_track['hdr_compatibility'].lower()
                if '10+' in hdr_kind and not device.video.hdr.ten_plus:
                    plan.video_filter_kind = snow_media.filter_kind.hdr_ten_plus_to_hdr_ten
                    plan.video_requires_transcode = True
            elif 'hdr_format' in video_track:
                hdr_kind = video_track['hdr_format'].lower()
                if 'dolby vision' in hdr_kind and not device.video.hdr.dolby_vision:
                    plan.video_filter_kind = snow_media.filter_kind.dolby_vision_to_hdr_ten
                    plan.video_requires_transcode = True
        if 'audio' in snowstream_info['tracks']:
            for audio_track in snowstream_info['tracks']['audio']:
                if 'codec' in audio_track:
                    if 'TrueHD' in audio_track['codec'] and not device.audio.dolby.hd:
                        plan.audio_requires_transcode[audio_track['relative_index']] = True
    return plan
