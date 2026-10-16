import React from 'react'
import { View } from 'react-native'
import Snow from 'expo-snowui'

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
    const isTranscode = useHubState((state) => state?.isTranscode)
    const audioTrackIndex = useHubState((state) => state?.audioTrackIndex)
    const subtitleTrackIndex = useHubState((state) => state?.subtitleTrackIndex)
    const seekToSeconds = useHubState((state) => state?.seekToSeconds)

    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)
    const videoRef = React.useRef(null)

    const styles = {
        wrapper: {
            width: getWindowWidth(),
            height: getWindowHeight(),
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
            backgroundColor: 'black'
        }
    }

    const safeUrl = videoUrl ? encodeURI(videoUrl) : ''

    const userClickedPlay = () => {
        sendHubData({ isVideoViewReady: true, isPlaying: true }, 'player.ready')
        emitHubEvent('player.ready')
        setUserPlayed(true)
        if (videoRef.current) {
            videoRef.current.play().catch(() => { })
        }
    }

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
        if (!videoRef.current || !userPlayed) {
            return
        }
        if (isPlaying) {
            videoRef.current.play().catch(() => { })
        } else {
            videoRef.current.pause()
        }
    }, [isPlaying, userPlayed])

    React.useEffect(() => {
        if (seekToSeconds > -1 && videoRef.current) {
            videoRef.current.currentTime = seekToSeconds
        }
    }, [seekToSeconds])

    if (!userPlayed) {
        return (
            <View style={styles.wrapper}>
                <Snow.TextButton
                    focusStart
                    focusKey="web-play-button"
                    title="Press to Begin Web Playback"
                    onPress={userClickedPlay}
                />
            </View>
        )
    }

    if (!isTranscode && (audioTrackIndex > 0 || subtitleTrackIndex > 0)) {
        return (
            <View style={styles.wrapper}>
                <Snow.Text>Waiting on transcode...</Snow.Text>
            </View>
        )
    }

    if (requestTranscode && !isTranscode) {
        return (
            <View style={styles.wrapper}>
                <Snow.Text>Waiting on transcode...</Snow.Text>
            </View>
        )
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
                onTimeUpdate={(event) => {
                    emitHubEvent('player.update', {
                        kind: 'rnvevent',
                        data: {
                            event: 'onProgress',
                            data: {
                                currentTime: event.target.currentTime,
                                playableDuration: event.target.duration,
                                seekableDuration: event.target.duration
                            }
                        }
                    })
                }}
                onCanPlay={() => {
                    sendHubData({ isSeekable: true }, 'player.seekable')
                }}
                onEnded={() => {
                    emitHubEvent('player.update', {
                        kind: 'rnvevent',
                        data: {
                            event: 'onEnd'
                        }
                    })
                }}
                onError={(event) => {
                    emitHubEvent('player.error', {
                        kind: 'web',
                        message: 'HTML5 video playback error',
                        error: event
                    })
                }}
            />
        </View>
    )
}