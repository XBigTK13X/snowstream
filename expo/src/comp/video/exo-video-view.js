import React from 'react'
import ExoPlayerView from 'expo-exoplayer'
import Snow from 'expo-snowui'
import CONST from '../../constant'
import { useAppContext } from '../../app-context'

export default function ExoVideoView(props) {
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
    const audioTrackIndex = useHubState((state) => state?.audioTrackIndex)
    const subtitleTrackIndex = useHubState((state) => state?.subtitleTrackIndex)
    const playbackSpeed = useHubState((state) => state?.playbackSpeed)

    const forwardRef = React.useRef(null)

    React.useEffect(() => {
        if (!videoUrl || isVideoViewReady) {
            return
        }
        emitHubEvent('player.ready')
    }, [videoUrl, isVideoViewReady, emitHubEvent])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && isVideoViewReady && playbackSpeed !== undefined) {
            forwardRef.current.runCommand(`speed|${playbackSpeed}`)
        }
    }, [playbackSpeed, isVideoViewReady])

    const eventHandler = (rawEvent) => {
        const exoPlayerEvent = rawEvent?.nativeEvent || rawEvent
        if (!exoPlayerEvent?.property) {
            return
        }

        if (exoPlayerEvent.property === 'time-pos') {
            let adjustedSeconds = Math.floor(exoPlayerEvent.value)
            if (isTranscode) {
                adjustedSeconds += seekToSeconds ?? 0
            }
            emitHubEvent('player.progress', {
                seconds: adjustedSeconds,
                source: 'player-event'
            })
        } else if (exoPlayerEvent.property === 'seekable') {
            sendHubData({ isSeekable: true }, 'player.seekable')
        } else if (!['demuxer-cache-time', 'track-list'].includes(exoPlayerEvent.property)) {
            emitHubEvent('player.log', { kind: 'exoevent', exoPlayerEvent })
        }

        if (exoPlayerEvent.property === 'eof-reached' && isSeekable) {
            emitHubEvent('player.update', {
                kind: 'exoevent',
                data: {
                    event: 'onEnd'
                }
            })
        }
    }

    const logHandler = (rawLog) => {
        const exoPlayerLog = rawLog?.nativeEvent || rawLog
        if (exoPlayerLog?.text && exoPlayerLog.text.includes('Playback failure')) {
            emitHubEvent('player.error', {
                kind: 'exoplayer',
                message: 'Unable to open file',
                log: exoPlayerLog
            })
        }
        if (exoPlayerLog?.text && !exoPlayerLog.text.includes('Description:')) {
            emitHubEvent('player.log', { kind: 'exolog', exoPlayerLog })
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

    const safeUrl = encodeURI(decodeURI(videoUrl))

    return (
        <ExoPlayerView
            ref={forwardRef}
            style={{ flex: 1, width: '100%', height: '100%' }}
            playUrl={safeUrl}
            isPlaying={isPlaying}
            surfaceWidth={resolvedWidth}
            surfaceHeight={resolvedHeight}
            selectedAudioTrack={audioTrackIndex ?? 0}
            selectedSubtitleTrack={subtitleTrackIndex ?? 0}
            seekToSeconds={seekToSeconds ?? 0}
            onExoPlayerEvent={eventHandler}
            onExoPlayerLog={logHandler}
        />
    )
}