import snow_media

from log import log

# These plans have an impact on the client and server
# Client-side they can determine if exo/mpv should be used, and other similar actions
# Server-side they can force the transcode command builder to use different arguments

class PlaybackPlan:
    def __init__(self):
        self.player = 'mpv'
        self.mpv_video_output = None
        self.mpv_decoding_mode = None
        self.mpv_accelerated_codecs = None
        self.transcode_container = None
        self.transcode_video_codec = None
        self.transcode_audio_codec = None
        self.transcode_bit_rate = None
        self.video_filter_kind = None
        self.video_requires_transcode = False
        self.audio_requires_transcode = {}
        self.reasons = []


def create_plan(device_profile:str, snowstream_info:dict, video_kind:str):
    device = snow_media.device.get_device(device_profile)
    plan = PlaybackPlan()

    plan.transcode_container = device.transcode.container
    plan.transcode_audio_codec = device.transcode.audio_codec
    plan.transcode_video_codec = device.transcode.video_codec

    plan.mpv_video_output = device.mpv.video_output
    plan.mpv_decoding_mode = device.mpv.decoding_mode
    plan.mpv_accelerated_codecs = device.mpv.accelerated_codecs

    if device.force_player:
        plan.player = device.force_player

    if device.transcode.bit_rate:
        plan.transcode_bit_rate = device.transcode.bit_rate

    if snowstream_info and 'tracks' in snowstream_info:
        # Video plans
        if 'video' in snowstream_info['tracks']:
            video_track = snowstream_info['tracks']['video'][0]

            # HDR
            if 'hdr_format' in video_track:
                plan.transcode_container = device.transcode.hdr_container
                plan.player = 'exo'
                plan.reasons.append('mpv cannot passthrough HDR')

            hdr_kind = None
            if 'hdr_compatibility' in video_track and video_track['hdr_compatibility']:
                hdr_kind = video_track['hdr_compatibility'].lower()
                if '10+' in hdr_kind and not device.video.hdr.ten_plus:
                    plan.video_filter_kind = snow_media.filter_kind.hdr_ten_plus_to_hdr_ten
                    plan.video_requires_transcode = True
                    plan.reasons.append('Device does not support HDR10+ video')
            if not hdr_kind and 'hdr_format' in video_track and video_track['hdr_format']:
                hdr_kind = video_track['hdr_format'].lower()
                if 'dolby vision' in hdr_kind and not device.video.hdr.dolby_vision:
                    plan.video_filter_kind = snow_media.filter_kind.dolby_vision_to_hdr_ten
                    plan.video_requires_transcode = True
                    plan.reasons.append('Device does not support Dolby Vision video')

            # High frame rate
            if device.video.high_fps == 'soft' and int(video_track['fps']) > 24:
                plan.mpv_decoding_mode = 'mediacodec'
                plan.reasons.append('High frame rate video too heavy for mediacodec-copy')

            # Video codec compatibility
            if 'av1' in video_track['format'].lower():
                if device.video.av1 != 'hard':
                    plan.reasons.append('Device does not support AV1 codec')
                    if device.video.av1 == 'transcode':
                        plan.video_requires_transcode = True
                    if device.video.av1 == 'soft':
                        plan.mpv_decoding_mode = 'no'

            if device.video.h265.ten == 'soft' and 'hevc' in video_track['format'].lower() and '10' in video_track['bit_depth']:
                plan.mpv_decoding_mode = 'no'
                plan.reasons.append('Device cannot hardware accelerate h265 10 bit')

            if device.video.h264.ten == 'soft' and 'avc' in video_track['format'].lower() and '10' in video_track['bit_depth']:
                plan.mpv_decoding_mode = 'no'
                plan.reasons.append('Device cannot hardware accelerate h264 10 bit')

            log.info(video_kind)
            log.info(device.video.streamable_decoding)

            if video_kind == 'streamable' and device.video.streamable_decoding:
                plan.mpv_decoding_mode = device.video.streamable_decoding
                plan.reasons.append('Device cannot use mediacodec-copy on streamables')

        # Audio
        if 'audio' in snowstream_info['tracks']:
            for audio_track in snowstream_info['tracks']['audio']:
                if 'codec' in audio_track:
                    if 'TrueHD' in audio_track['codec'] and not device.audio.dolby.hd:
                        plan.audio_requires_transcode[audio_track['relative_index']] = True
                        plan.reasons.append('Device does not support TrueHD audio')

        if not plan.reasons:
            plan.reasons.append('No plan needed. Device can play the media or fallback to transcode')
    return plan
