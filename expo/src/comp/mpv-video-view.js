import React from 'react'
import LibmpvView, { DEFAULT_ACCELERATED_CODECS } from 'expo-libmpv';
import Player from 'snowstream-player'
import CONST from '../constant'

// https://mpv.io/manual/master/#property-manipulation

export default function MpvVideoView(props) {
    const player = Player.useSnapshot(Player.state)

    const forwardRef = React.useRef(null);

    React.useEffect(() => {
        if (!player || !player.clientOptions) {
            return
        }
        if (!player.isVideoViewReady && forwardRef?.current?.runCommand) {
            if (player.clientOptions.audioCompression) {
                // Loudness normalization from Snowby
                forwardRef.current.runCommand(`set|af|acompressor=ratio=4,loudnorm`).catch(() => { })
            }
            else {
                forwardRef.current.runCommand(`set|del-af|@`).catch(() => { })
            }
            Player.action.onVideoReady()
        }
    })

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-scale|${player.subtitleFontScale}`).catch(() => { })
        }

    }, [player.subtitleFontScale])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`).catch(() => { })
            forwardRef.current.runCommand(`set|sub-color|${player.subtitleColor.shade}/${player.subtitleColor.alpha}`).catch(() => { })
        }
    }, [player.subtitleColor])

    React.useEffect(() => {
        if (player.audioDelaySeconds !== undefined && forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|audio-delay|${player.audioDelaySeconds}`).catch(() => { })
        }
    }, [player.audioDelaySeconds])

    React.useEffect(() => {
        if (player.subtitleDelaySeconds !== undefined && forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-delay|${player.subtitleDelaySeconds}`).catch(() => { })
        }
    }, [player.subtitleDelaySeconds])

    const eventHandler = (libmpvEvent) => {
        Player.action.onVideoUpdate({ kind: 'mpvevent', libmpvEvent })
    }

    const logHandler = (libmpvLog) => {
        Player.action.onVideoUpdate({ kind: 'mpvlog', libmpvLog })
    }

    if (!player || !player.clientOptions) {
        return null
    }

    let videoWidth = CONST.resolution.fullHd.width
    let videoHeight = CONST.resolution.fullHd.height
    if (player.clientOptions?.resolutionKind === '2160p') {
        videoWidth = CONST.resolution.ultraHd.width
        videoHeight = CONST.resolution.ultraHd.height
    }
    if (player.clientOptions?.resolutionKind === 'Video File') {
        videoWidth = player.videoWidth
        videoHeight = player.videoHeight
    }
    let videoOutput = player.playbackPlan?.mpv_video_output
    if (!videoOutput) {
        videoOutput = 'gpu'
    }
    let decodingMode = player.playbackPlan?.mpv_decoding_mode
    if (player.mpvDecodingMode) {
        decodingMode = player.mpvDecodingMode
    }
    else {
        if (!decodingMode) {
            decodingMode = 'mediacodec-copy'
        }
    }
    let acceleratedCodecs = player.playbackPlan?.mpv_accelerated_codecs
    if (!acceleratedCodecs) {
        acceleratedCodecs = 'h264,hevc,mpeg4,mpeg2video,vp8,vp9,av1'
    }
    let videoSync = player.playbackPlan?.mpv_video_sync
    if (!videoSync) {
        videoSync = 'audio'
    }

    return (
        <LibmpvView
            ref={forwardRef}
            videoOutput={videoOutput}
            decodingMode={decodingMode}
            acceleratedCodecs={acceleratedCodecs}
            videoSync={videoSync}
            playUrl={player.videoUrl}
            isPlaying={player.isPlaying}
            surfaceWidth={videoWidth}
            surfaceHeight={videoHeight}
            onLibmpvEvent={eventHandler}
            onLibmpvLog={logHandler}
            selectedAudioTrack={player.audioTrackIndex}
            selectedSubtitleTrack={player.subtitleTrackIndex}
            seekToSeconds={player.seekToSeconds}
        />
    )
}
