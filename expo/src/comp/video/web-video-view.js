import React from 'react'
import { View } from 'react-native'
import Snow from '@snowsuite/expo-snowui'

export default function WebVideoView(props) {
    const {
        getWindowWidth,
        getWindowHeight,
        emitHubEvent,
        sendHubData,
        useHubState
    } = Snow.useSnowContext(props)

    const videoUrl = useHubState((state) => state?.videoUrl)
    const isPlaying = useHubState((state) => state?.isPlaying)
    const isVideoViewReady = useHubState((state) => state?.isVideoViewReady)
    const isTranscode = useHubState((state) => state?.isTranscode)
    const isSeekable = useHubState((state) => state?.isSeekable)
    const audioTrackIndex = useHubState((state) => state?.audioTrackIndex)
    const subtitleTrackIndex = useHubState((state) => state?.subtitleTrackIndex)
    const seekToSeconds = useHubState((state) => state?.seekToSeconds)
    const isMuted = useHubState((state) => state?.isMuted) ?? true

    const [requestTranscode, setRequestTranscode] = React.useState(false)
    const videoRef = React.useRef(null)
    const firstFrameFiredRef = React.useRef(false)
    const lastAppliedSeekRef = React.useRef(seekToSeconds)

    React.useEffect(() => {
        firstFrameFiredRef.current = false
        lastAppliedSeekRef.current = seekToSeconds
    }, [videoUrl])

    React.useEffect(() => {
        if (!videoUrl || isVideoViewReady) {
            return
        }
        emitHubEvent('player.ready')
    }, [videoUrl, isVideoViewReady, emitHubEvent])

    React.useEffect(() => {
        if (!requestTranscode) {
            if (!isTranscode && (audioTrackIndex > 0 || subtitleTrackIndex > 0)) {
                setRequestTranscode(true)
                emitHubEvent('player.error', {
                    kind: 'web',
                    message: 'web video player cannot select tracks',
                    error: { code: 4 }
                })
            }
        }
    }, [isTranscode, audioTrackIndex, subtitleTrackIndex, requestTranscode, emitHubEvent])

    React.useEffect(() => {
        if (!videoRef.current) {
            return
        }
        if (isPlaying) {
            videoRef.current.play().catch(() => { })
        } else {
            videoRef.current.pause()
        }
    }, [isPlaying])

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted
        }
    }, [isMuted])

    React.useEffect(() => {
        if (seekToSeconds == null || isTranscode) {
            return
        }
        if (seekToSeconds !== lastAppliedSeekRef.current) {
            lastAppliedSeekRef.current = seekToSeconds
            if (videoRef.current) {
                videoRef.current.currentTime = seekToSeconds
            }
        }
    }, [seekToSeconds, isTranscode])

    const handleVideoClick = () => {
        if (!videoRef.current) {
            return
        }

        if (isMuted) {
            videoRef.current.muted = false
            sendHubData({ isMuted: false }, 'player.unmuted')
        }
    }

    const safeUrl = videoUrl ? encodeURI(videoUrl) : ''

    const styles = {
        wrapper: {
            width: getWindowWidth ? getWindowWidth() : '100%',
            height: getWindowHeight ? getWindowHeight() : '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black'
        },
        video: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: 'black',
            cursor: isMuted ? 'pointer' : 'default'
        },
        muteIndicator: {
            position: 'absolute',
            bottom: 32,
            right: 32,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            pointerEvents: 'none'
        }
    }

    if (!safeUrl) {
        return null
    }

    return (
        <View style={styles.wrapper}>
            <video
                ref={videoRef}
                src={safeUrl}
                style={styles.video}
                playsInline
                autoPlay
                muted={isMuted}
                onClick={handleVideoClick}
                onLoadedMetadata={() => {
                    if (!isTranscode && seekToSeconds && seekToSeconds > 0 && videoRef.current) {
                        videoRef.current.currentTime = seekToSeconds
                    }
                }}
                onPlaying={() => {
                    if (!firstFrameFiredRef.current) {
                        firstFrameFiredRef.current = true
                        emitHubEvent('player.firstFrame')
                    }
                }}
                onTimeUpdate={(eventInfo) => {
                    const rawPosition = eventInfo.target.currentTime
                    if (!firstFrameFiredRef.current && rawPosition > 0.05) {
                        firstFrameFiredRef.current = true
                        emitHubEvent('player.firstFrame')
                    }

                    if (!isSeekable) {
                        sendHubData({ isSeekable: true }, 'player.seekable')
                    }

                    let adjustedSeconds = Math.floor(rawPosition)
                    if (isTranscode) {
                        adjustedSeconds += seekToSeconds ?? 0
                    }
                    emitHubEvent('player.progress', {
                        seconds: adjustedSeconds,
                        source: 'player-event'
                    })
                }}
                onCanPlay={() => {
                    if (!isSeekable) {
                        sendHubData({ isSeekable: true }, 'player.seekable')
                    }
                }}
                onEnded={() => {
                    emitHubEvent('player.update', {
                        kind: 'exoevent',
                        data: {
                            event: 'onEnd'
                        }
                    })
                }}
                onError={(eventInfo) => {
                    emitHubEvent('player.error', {
                        kind: 'web',
                        message: 'HTML5 video playback error',
                        error: eventInfo
                    })
                }}
            />
            {isMuted ? (
                <View style={styles.muteIndicator}>
                    <Snow.Text style={{ fontSize: 13, opacity: 0.85 }}>
                        Click anywhere to unmute
                    </Snow.Text>
                </View>
            ) : null}
        </View>
    )
}