import React from 'react'
import ExoPlayerView from '@snowsuite/expo-exoplayer'
import Snow from '@snowsuite/expo-snowui'
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
    const subtitleFontScale = useHubState((state) => state?.subtitleFontScale)
    const subtitleColor = useHubState((state) => state?.subtitleColor)

    const forwardRef = React.useRef(null)
    const firstFrameFiredRef = React.useRef(false)
    const initialPosRef = React.useRef(null)
    const lastAppliedSeekRef = React.useRef(seekToSeconds)

    React.useEffect(() => {
        firstFrameFiredRef.current = false
        initialPosRef.current = null
        lastAppliedSeekRef.current = seekToSeconds
    }, [videoUrl])

    React.useEffect(() => {
        if (!videoUrl || isVideoViewReady) {
            return
        }
        emitHubEvent('player.ready')
    }, [videoUrl, isVideoViewReady, emitHubEvent])

    React.useEffect(() => {
        if (!isVideoViewReady || isTranscode || seekToSeconds == null) {
            return
        }
        if (seekToSeconds !== lastAppliedSeekRef.current) {
            lastAppliedSeekRef.current = seekToSeconds
            if (forwardRef.current?.runCommand) {
                forwardRef.current.runCommand(`seek|${seekToSeconds}`).catch(() => { })
            }
        }
    }, [seekToSeconds, isVideoViewReady, isTranscode])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && isVideoViewReady && playbackSpeed !== undefined) {
            forwardRef.current.runCommand(`speed|${playbackSpeed}`)
        }
    }, [playbackSpeed, isVideoViewReady])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && isVideoViewReady && subtitleFontScale !== undefined) {
            forwardRef.current.runCommand(`set|sub-scale|${subtitleFontScale}`)
        }
    }, [subtitleFontScale, isVideoViewReady])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && isVideoViewReady && subtitleColor) {
            forwardRef.current.runCommand(`set|sub-color|${subtitleColor.shade}/${subtitleColor.alpha}`)
        }
    }, [subtitleColor, isVideoViewReady])

    const eventHandler = (rawEvent) => {
        const exoPlayerEvent = rawEvent?.nativeEvent || rawEvent
        if (!exoPlayerEvent?.property) {
            return
        }

        if (exoPlayerEvent.property === 'time-pos') {
            const rawPos = Number(exoPlayerEvent.value)

            if (!firstFrameFiredRef.current && !isNaN(rawPos)) {
                const targetPos = isTranscode ? 0 : (seekToSeconds || 0)
                if (targetPos > 0 && rawPos < targetPos - 2) {
                    // Waiting on initial seek to settle
                } else if (initialPosRef.current === null) {
                    initialPosRef.current = rawPos
                    if (rawPos > targetPos + 0.1) {
                        firstFrameFiredRef.current = true
                        emitHubEvent('player.firstFrame')
                    }
                } else if (rawPos > initialPosRef.current + 0.03) {
                    firstFrameFiredRef.current = true
                    emitHubEvent('player.firstFrame')
                }
            }

            if (!isSeekable) {
                sendHubData({ isSeekable: true }, 'player.seekable')
            }
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

        if (exoPlayerEvent.property === 'eof-reached') {
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

    const safeUrl = videoUrl.includes('%')
        ? videoUrl
        : encodeURI(videoUrl).replace(/#/g, '%23')

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