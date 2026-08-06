import React from 'react'
import { Platform } from 'react-native'
import Snow from 'expo-snowui'
import Player from 'snowstream-player'
import { useVideoPlayer, VideoView } from 'expo-video'

const isWeb = Platform.OS === 'web'

export default function RnvVideoView(props) {
    const { getWindowWidth, getWindowHeight } = Snow.useSnowContext(props)
    const playerState = Player.useSnapshot(Player.state)
    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)

    const fontSize = getWindowHeight() * 0.033

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
            alignSelf: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'transparent'
        }
    }

    let userClickedPlay = () => { }
    if (isWeb) {
        userClickedPlay = () => {
            Player.action.onVideoReady()
            setUserPlayed(true)
        }
    }

    const onError = (err) => {
        err.kind = 'rnv'
        Player.action.onVideoError(err)
    }

    const onRnvEvent = (kind) => {
        return (payload) => {
            Player.action.onVideoUpdate({
                kind: 'rnvevent',
                data: {
                    event: kind,
                    data: payload
                }
            })
        }
    }

    const videoPlayer = useVideoPlayer(playerState.videoUrl || '', (instance) => {
        instance.loop = false
        instance.staysActiveInBackground = false
        instance.preservesPitch = true

        if (playerState.isPlaying) {
            instance.play()
        } else {
            instance.pause()
        }
    })

    React.useEffect(() => {
        if (!isWeb && !playerState.isVideoViewReady) {
            Player.action.onVideoReady()
        }
        if (isWeb && !requestTranscode) {
            if (!playerState.isTranscode && (playerState.audioTrackIndex > 0 || playerState.subtitleTrackIndex > 0)) {
                setRequestTranscode(true)
                onError({ message: 'web video player cannot select tracks', error: { code: 4 } })
            }
        }
    }, [])

    React.useEffect(() => {
        if (!videoPlayer) {
            return
        }

        if (playerState.isPlaying) {
            videoPlayer.play()
        } else {
            videoPlayer.pause()
        }
    }, [playerState.isPlaying, videoPlayer])

    React.useEffect(() => {
        if (playerState.seekToSeconds > -1 && videoPlayer) {
            videoPlayer.currentTime = playerState.seekToSeconds
        }
    }, [playerState.seekToSeconds, videoPlayer])

    React.useEffect(() => {
        if (!videoPlayer) {
            return
        }

        const statusSub = videoPlayer.addListener('statusChange', (payload) => {
            onRnvEvent('onPlaybackStateChanged')(payload)
            if (payload.status === 'error' && payload.error) {
                onError(payload.error)
            }
        })

        const playToEndSub = videoPlayer.addListener('playToEnd', () => {
            onRnvEvent('onEnd')()
        })

        const timeUpdateSub = videoPlayer.addListener('timeUpdate', (payload) => {
            onRnvEvent('onProgress')(payload)
        })

        const sourceChangeSub = videoPlayer.addListener('sourceChange', (payload) => {
            onRnvEvent('onLoadStart')(payload)
        })

        const volumeChangeSub = videoPlayer.addListener('volumeChange', (payload) => {
            onRnvEvent('onVolumeChange')(payload)
        })

        const playbackRateSub = videoPlayer.addListener('playbackRateChange', (payload) => {
            onRnvEvent('onPlaybackRateChange')(payload)
        })

        return () => {
            statusSub.remove()
            playToEndSub.remove()
            timeUpdateSub.remove()
            sourceChangeSub.remove()
            volumeChangeSub.remove()
            playbackRateSub.remove()
        }
    }, [videoPlayer])

    if (isWeb) {
        if (!userPlayed) {
            return (
                <Snow.TextButton title="Web requires this button be pressed" onPress={userClickedPlay} />
            )
        }
        if (!playerState.isTranscode && (playerState.audioTrackIndex > 0 || playerState.subtitleTrackIndex > 0)) {
            return <Snow.Text>Waiting on transcode...</Snow.Text>
        }
        if (requestTranscode && !playerState.isTranscode) {
            return <Snow.Text>Waiting on transcode...</Snow.Text>
        }
    }

    if (!playerState.videoUrl) {
        return null
    }

    const shade = playerState.subtitleColor.shade * 255
    const subtitleStyle = {
        fontSize: playerState.subtitleFontScale * fontSize,
        color: `rgba(${shade}, ${shade}, ${shade})`,
        textShadowColor: 'rgba(0, 0, 0)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        opacity: 0.9
    }

    return (
        <VideoView
            style={styles.video}
            player={videoPlayer}
            nativeControls={false}
            contentFit="contain"
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            subtitleStyle={subtitleStyle}
        />
    )
}