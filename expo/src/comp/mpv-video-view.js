import React from 'react'
import LibmpvView from 'expo-libmpv'
import Snow from 'expo-snowui'
import CONST from '../constant'
import { useAppContext } from '../app-context'

export default function MpvVideoView(props) {
    const { envelope, updateEnvelope, actions } = Snow.useSnowContext()
    const { clientOptions } = useAppContext()

    const forwardRef = React.useRef(null)

    React.useEffect(() => {
        if (!clientOptions) {
            return
        }
        if (!envelope?.isVideoViewReady && forwardRef.current?.runCommand) {
            if (clientOptions.audioCompression) {
                forwardRef.current.runCommand('set|af|acompressor=ratio=4,loudnorm').catch(() => { })
            } else {
                forwardRef.current.runCommand('set|del-af|@').catch(() => { })
            }
            updateEnvelope({ isVideoViewReady: true, isPlaying: true })
            actions?.addLog?.({ kind: 'snowstream', message: 'low level video player reports that it is ready to play' })
        }
    })

    const disableHeavyAss = () => {
        forwardRef.current.runCommand('set|sub-ass-override|force').catch(() => { })
    }

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && envelope?.isVideoViewReady) {
            disableHeavyAss()
            forwardRef.current.runCommand(`set|sub-scale|${envelope.subtitleFontScale}`).catch(() => { })
        }
    }, [envelope?.subtitleFontScale, envelope?.isVideoViewReady])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && envelope?.isVideoViewReady && envelope?.subtitleColor) {
            disableHeavyAss()
            forwardRef.current.runCommand(`set|sub-color|${envelope.subtitleColor.shade}/${envelope.subtitleColor.alpha}`).catch(() => { })
        }
    }, [envelope?.subtitleColor, envelope?.isVideoViewReady])

    React.useEffect(() => {
        if (envelope?.audioDelaySeconds !== undefined && forwardRef.current?.runCommand && envelope?.isVideoViewReady) {
            forwardRef.current.runCommand(`set|audio-delay|${envelope.audioDelaySeconds}`).catch(() => { })
        }
    }, [envelope?.audioDelaySeconds, envelope?.isVideoViewReady])

    React.useEffect(() => {
        if (envelope?.subtitleDelaySeconds !== undefined && forwardRef.current?.runCommand && envelope?.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-delay|${envelope.subtitleDelaySeconds}`).catch(() => { })
        }
    }, [envelope?.subtitleDelaySeconds, envelope?.isVideoViewReady])

    const eventHandler = (libmpvEvent) => {
        if (!libmpvEvent?.property) {
            return
        }

        if (libmpvEvent.property === 'time-pos') {
            let adjustedSeconds = Math.floor(libmpvEvent.value)
            if (envelope?.isTranscode) {
                adjustedSeconds += envelope?.seekToSeconds ?? 0
            }
            actions?.onProgress?.(adjustedSeconds, 'player-event')
        } else if (libmpvEvent.property === 'seekable') {
            updateEnvelope({ isSeekable: true })
        } else if (!['demuxer-cache-time', 'track-list'].includes(libmpvEvent.property)) {
            actions?.addLog?.({ kind: 'mpvevent', libmpvEvent })
        }

        if (libmpvEvent.property === 'eof-reached' && envelope?.isSeekable) {
            actions?.onPlaybackComplete?.()
        }
    }

    const logHandler = (libmpvLog) => {
        if (libmpvLog?.text && !libmpvLog.text.includes('Description:')) {
            actions?.addLog?.({ kind: 'mpvlog', libmpvLog })
        }
    }

    if (!clientOptions || !envelope?.videoUrl) {
        return null
    }

    let videoWidth = CONST.resolution.fullHd.width
    let videoHeight = CONST.resolution.fullHd.height
    if (clientOptions.resolutionKind === '2160p') {
        videoWidth = CONST.resolution.ultraHd.width
        videoHeight = CONST.resolution.ultraHd.height
    }
    if (clientOptions.resolutionKind === 'Video File') {
        videoWidth = envelope.videoWidth
        videoHeight = envelope.videoHeight
    }

    let videoOutput = envelope.playbackPlan?.mpv_video_output || 'gpu'
    let decodingMode = envelope.mpvDecodingMode || envelope.playbackPlan?.mpv_decoding_mode || 'mediacodec'
    let acceleratedCodecs = envelope.playbackPlan?.mpv_accelerated_codecs || 'h264,hevc,mpeg4,mpeg2video,vp8,vp9,av1'
    let videoSync = envelope.playbackPlan?.mpv_video_sync || 'audio'

    return (
        <LibmpvView
            ref={forwardRef}
            videoOutput={videoOutput}
            decodingMode={decodingMode}
            acceleratedCodecs={acceleratedCodecs}
            videoSync={videoSync}
            playUrl={envelope.videoUrl}
            isPlaying={envelope.isPlaying}
            surfaceWidth={videoWidth}
            surfaceHeight={videoHeight}
            onLibmpvEvent={eventHandler}
            onLibmpvLog={logHandler}
            selectedAudioTrack={envelope.audioTrackIndex}
            selectedSubtitleTrack={envelope.subtitleTrackIndex}
            seekToSeconds={envelope.seekToSeconds}
        />
    )
}