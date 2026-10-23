import React from 'react'
import LibmpvView from '@snowsuite/expo-libmpv'
import Snow from '@snowsuite/expo-snowui'
import CONST from '../../constant'
import { useAppContext } from '../../app-context'

export default function MpvVideoView(props) {
    const {
        sendHubData,
        emitHubEvent,
        useHubState
    } = Snow.useSnowContext(props)
    const appContext = useAppContext()
    const clientOptions = props.clientOptions || appContext?.clientOptions || {}

    const videoUrl = useHubState((state) => state?.videoUrl)
    const isPlaying = useHubState((state) => state?.isPlaying)
    const isVideoViewReady = useHubState((state) => state?.isVideoViewReady)
    const isTranscode = useHubState((state) => state?.isTranscode)
    const isSeekable = useHubState((state) => state?.isSeekable)
    const seekToSeconds = useHubState((state) => state?.seekToSeconds)
    const videoWidthState = useHubState((state) => state?.videoWidth)
    const videoHeightState = useHubState((state) => state?.videoHeight)
    const playbackPlan = useHubState((state) => state?.playbackPlan)
    const mpvDecodingMode = useHubState((state) => state?.mpvDecodingMode)
    const audioTrackIndex = useHubState((state) => state?.audioTrackIndex)
    const subtitleTrackIndex = useHubState((state) => state?.subtitleTrackIndex)
    const audioDelaySeconds = useHubState((state) => state?.audioDelaySeconds)
    const subtitleDelaySeconds = useHubState((state) => state?.subtitleDelaySeconds)
    const subtitleFontScale = useHubState((state) => state?.subtitleFontScale)
    const subtitleColor = useHubState((state) => state?.subtitleColor)

    const forwardRef = React.useRef(null)

    React.useEffect(() => {
        if (!videoUrl || isVideoViewReady) {
            return
        }
        if (forwardRef.current?.runCommand) {
            if (clientOptions?.audioCompression) {
                forwardRef.current.runCommand('set|af|acompressor=ratio=4,loudnorm').catch(() => { })
            } else {
                forwardRef.current.runCommand('set|del-af|@').catch(() => { })
            }
        }
        emitHubEvent('player.ready')
    }, [videoUrl, isVideoViewReady, clientOptions, emitHubEvent])

    const disableHeavyAss = () => {
        forwardRef.current?.runCommand?.('set|sub-ass-override|force').catch(() => { })
    }

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && isVideoViewReady && subtitleFontScale !== undefined) {
            disableHeavyAss()
            forwardRef.current.runCommand(`set|sub-scale|${subtitleFontScale}`).catch(() => { })
        }
    }, [subtitleFontScale, isVideoViewReady])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && isVideoViewReady && subtitleColor) {
            disableHeavyAss()
            forwardRef.current.runCommand(`set|sub-color|${subtitleColor.shade}/${subtitleColor.alpha}`).catch(() => { })
        }
    }, [subtitleColor, isVideoViewReady])

    React.useEffect(() => {
        if (audioDelaySeconds !== undefined && forwardRef.current?.runCommand && isVideoViewReady) {
            forwardRef.current.runCommand(`set|audio-delay|${audioDelaySeconds}`).catch(() => { })
        }
    }, [audioDelaySeconds, isVideoViewReady])

    React.useEffect(() => {
        if (subtitleDelaySeconds !== undefined && forwardRef.current?.runCommand && isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-delay|${subtitleDelaySeconds}`).catch(() => { })
        }
    }, [subtitleDelaySeconds, isVideoViewReady])

    const eventHandler = (rawEvent) => {
        const libmpvEvent = rawEvent?.nativeEvent || rawEvent
        if (!libmpvEvent?.property) {
            return
        }

        if (libmpvEvent.property === 'time-pos') {
            let adjustedSeconds = Math.floor(libmpvEvent.value)
            if (isTranscode) {
                adjustedSeconds += seekToSeconds ?? 0
            }
            emitHubEvent('player.progress', {
                seconds: adjustedSeconds,
                source: 'player-event'
            })
        } else if (libmpvEvent.property === 'seekable') {
            sendHubData({ isSeekable: true }, 'player.seekable')
        } else if (!['demuxer-cache-time', 'track-list'].includes(libmpvEvent.property)) {
            emitHubEvent('player.log', { kind: 'mpvevent', libmpvEvent })
        }

        if (libmpvEvent.property === 'eof-reached' && isSeekable) {
            emitHubEvent('player.update', {
                kind: 'mpvevent',
                data: {
                    event: 'onEnd'
                }
            })
        }
    }

    const logHandler = (rawLog) => {
        const libmpvLog = rawLog?.nativeEvent || rawLog
        if (libmpvLog?.text && !libmpvLog.text.includes('Description:')) {
            emitHubEvent('player.log', { kind: 'mpvlog', libmpvLog })
        }
    }

    if (!videoUrl) {
        return null
    }

    let resolvedWidth = CONST.resolution.fullHd.width
    let resolvedHeight = CONST.resolution.fullHd.height
    if (clientOptions?.resolutionKind === '2160p') {
        resolvedWidth = CONST.resolution.ultraHd.width
        resolvedHeight = CONST.resolution.ultraHd.height
    }
    if (clientOptions?.resolutionKind === 'Video File') {
        resolvedWidth = videoWidthState
        resolvedHeight = videoHeightState
    }

    let videoOutput = playbackPlan?.mpv_video_output || 'gpu'
    let decodingMode = mpvDecodingMode || playbackPlan?.mpv_decoding_mode || 'mediacodec'
    let acceleratedCodecs = playbackPlan?.mpv_accelerated_codecs || 'h264,hevc,mpeg4,mpeg2video,vp8,vp9,av1'
    let videoSync = playbackPlan?.mpv_video_sync || 'audio'

    const safeUrl = encodeURI(decodeURI(videoUrl))

    return (
        <LibmpvView
            ref={forwardRef}
            style={{ flex: 1, width: '100%', height: '100%' }}
            videoOutput={videoOutput}
            decodingMode={decodingMode}
            acceleratedCodecs={acceleratedCodecs}
            videoSync={videoSync}
            playUrl={safeUrl}
            isPlaying={isPlaying}
            surfaceWidth={resolvedWidth}
            surfaceHeight={resolvedHeight}
            onLibmpvEvent={eventHandler}
            onLibmpvLog={logHandler}
            selectedAudioTrack={audioTrackIndex}
            selectedSubtitleTrack={subtitleTrackIndex}
            seekToSeconds={seekToSeconds}
        />
    )
}