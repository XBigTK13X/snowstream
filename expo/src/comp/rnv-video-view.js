import React from 'react'
import { Platform } from 'react-native'
import Snow from 'expo-snowui'
import Player from 'snowstream-player'
import { useVideoPlayer, VideoView } from 'react-native-video'

const isWeb = Platform.OS === 'web'

export default function RnvVideoView(props) {
    const { getWindowWidth, getWindowHeight } = Snow.useSnowContext(props)
    const playerState = Player.useSnapshot(Player.state)
    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)
    const [availableTextTracks, setAvailableTextTracks] = React.useState([])
    const [availableAudioTracks, setAvailableAudioTracks] = React.useState([])

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

    const safeUrl = playerState.videoUrl ? encodeURI(playerState.videoUrl) : ''

    const nativePlayer = useVideoPlayer(safeUrl, (instance) => {
        if (!instance) return
        instance.loop = false
        instance.staysActiveInBackground = false
        instance.preservesPitch = true
    })

    const updateAvailableTracks = () => {
        if (!nativePlayer) return

        if (nativePlayer.textTracks && nativePlayer.textTracks.length > 0) {
            setAvailableTextTracks(nativePlayer.textTracks)
        }

        if (nativePlayer.audioTracks && nativePlayer.audioTracks.length > 0) {
            setAvailableAudioTracks(nativePlayer.audioTracks)
        }
    }

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
        if (!nativePlayer) return
        if (playerState.isPlaying) {
            nativePlayer.play?.()
        } else {
            nativePlayer.pause?.()
        }
    }, [playerState.isPlaying, nativePlayer])

    React.useEffect(() => {
        if (playerState.seekToSeconds > -1 && nativePlayer) {
            nativePlayer.seekTo(playerState.seekToSeconds)
        }
    }, [playerState.seekToSeconds, nativePlayer])

    React.useEffect(() => {
        if (!nativePlayer) return

        const currentTextTracks = availableTextTracks.length > 0 ? availableTextTracks : nativePlayer.textTracks
        const currentAudioTracks = availableAudioTracks.length > 0 ? availableAudioTracks : nativePlayer.audioTracks

        if (playerState.audioTrackIndex >= 0 && currentAudioTracks?.length > 0) {
            const track = currentAudioTracks[playerState.audioTrackIndex]
            if (track) {
                nativePlayer.selectedAudioTrack = track
            }
        }

        if (playerState.subtitleTrackIndex >= 0 && currentTextTracks?.length > 0) {
            const track = currentTextTracks[playerState.subtitleTrackIndex]
            if (track) {
                nativePlayer.selectedTextTrack = track
            }
        } else if (playerState.subtitleTrackIndex === -1) {
            nativePlayer.selectedTextTrack = null
        }
    }, [nativePlayer, availableTextTracks, availableAudioTracks, playerState.audioTrackIndex, playerState.subtitleTrackIndex])

    React.useEffect(() => {
        if (!nativePlayer) return

        const subProgress = nativePlayer.addEventListener('onProgress', (data) => {
            updateAvailableTracks()
            onRnvEvent('onProgress')(data)
        })
        const subEnd = nativePlayer.addEventListener('onEnd', () => onRnvEvent('onEnd')())
        const subLoad = nativePlayer.addEventListener('onLoad', (data) => {
            updateAvailableTracks()
            onRnvEvent('onLoad')(data)
        })
        const subPlaybackState = nativePlayer.addEventListener('onPlaybackStateChange', () => {
            updateAvailableTracks()
        })
        const subError = nativePlayer.addEventListener('onError', (err) => onError(err))

        return () => {
            const removeSub = (sub) => {
                if (typeof sub === 'function') {
                    sub()
                } else if (sub && typeof sub.remove === 'function') {
                    sub.remove()
                }
            }
            removeSub(subProgress)
            removeSub(subEnd)
            removeSub(subLoad)
            removeSub(subPlaybackState)
            removeSub(subError)
        }
    }, [nativePlayer])

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

    return (
        <VideoView
            style={styles.video}
            player={nativePlayer}
            controls={false}
            resizeMode="contain"
            viewType="surface"
        />
    )
}