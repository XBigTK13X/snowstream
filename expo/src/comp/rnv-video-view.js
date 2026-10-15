import React from 'react'
import { Platform } from 'react-native'
import Snow from 'expo-snowui'
import { useVideoPlayer, VideoView } from 'react-native-video'

const isWeb = Platform.OS === 'web'

export default function RnvVideoView(props) {
    const {
        getWindowWidth,
        getWindowHeight,
        envelope,
        updateEnvelope,
        dispatchEnvelopeAction
    } = Snow.useSnowContext(props)

    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)
    const [availableTextTracks, setAvailableTextTracks] = React.useState([])

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

    const safeUrl = envelope?.videoUrl ? encodeURI(envelope.videoUrl) : ''

    const nativePlayer = useVideoPlayer(safeUrl, (instance) => {
        if (!instance) return
        instance.loop = false
        instance.staysActiveInBackground = false
        instance.preservesPitch = true
    })

    const userClickedPlay = () => {
        updateEnvelope({ isVideoViewReady: true, isPlaying: true })
        dispatchEnvelopeAction('onVideoReady')
        setUserPlayed(true)
        if (nativePlayer) {
            nativePlayer.play()
        }
    }

    const onError = (err) => {
        err.kind = 'rnv'
        dispatchEnvelopeAction('onVideoError', err)
    }

    const onRnvEvent = (kind) => {
        return (payload) => {
            dispatchEnvelopeAction('onVideoUpdate', {
                kind: 'rnvevent',
                data: {
                    event: kind,
                    data: payload
                }
            })
        }
    }

    const updateAvailableTracks = () => {
        if (!nativePlayer) return

        const textTracks = nativePlayer.getAvailableTextTracks()
        setAvailableTextTracks(textTracks)
    }

    React.useEffect(() => {
        if (!isWeb && !envelope?.isVideoViewReady) {
            updateEnvelope({ isVideoViewReady: true, isPlaying: true })
            dispatchEnvelopeAction('onVideoReady')
        }

        if (isWeb && !requestTranscode) {
            if (!envelope?.isTranscode && (envelope?.audioTrackIndex > 0 || envelope?.subtitleTrackIndex > 0)) {
                setRequestTranscode(true)
                onError({ message: 'web video player cannot select tracks', error: { code: 4 } })
            }
        }
    }, [])

    React.useEffect(() => {
        if (!nativePlayer) return

        if (envelope?.isPlaying) {
            nativePlayer.play()
        } else {
            nativePlayer.pause()
        }
    }, [envelope?.isPlaying, nativePlayer])

    React.useEffect(() => {
        if (envelope?.seekToSeconds > -1 && nativePlayer) {
            nativePlayer.seekTo(envelope.seekToSeconds)
        }
    }, [envelope?.seekToSeconds, nativePlayer])

    React.useEffect(() => {
        if (!nativePlayer || isWeb) return

        const textTracks = availableTextTracks.length > 0
            ? availableTextTracks
            : nativePlayer.getAvailableTextTracks()

        if (envelope?.subtitleTrackIndex >= 0) {
            const track = textTracks[envelope.subtitleTrackIndex]

            if (track) {
                nativePlayer.selectTextTrack(track)
            }
        } else {
            nativePlayer.selectTextTrack(null)
        }
    }, [
        nativePlayer,
        availableTextTracks,
        envelope?.subtitleTrackIndex
    ])

    React.useEffect(() => {
        if (!nativePlayer) return

        const subProgress = nativePlayer.addEventListener('onProgress', (data) => {
            onRnvEvent('onProgress')(data)
        })

        const subEnd = nativePlayer.addEventListener('onEnd', () => {
            onRnvEvent('onEnd')()
        })

        const subLoad = nativePlayer.addEventListener('onLoad', (data) => {
            updateAvailableTracks()
            onRnvEvent('onLoad')(data)
        })

        const subTrackChange = nativePlayer.addEventListener('onTrackChange', (track) => {
            onRnvEvent('onTrackChange')(track)
        })

        const subError = nativePlayer.addEventListener('onError', (err) => {
            onError(err)
        })

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
            removeSub(subTrackChange)
            removeSub(subError)
        }
    }, [nativePlayer])

    if (isWeb) {
        if (!userPlayed) {
            return (
                <Snow.TextButton title="Web requires this button be pressed" onPress={userClickedPlay} />
            )
        }

        if (!envelope?.isTranscode && (envelope?.audioTrackIndex > 0 || envelope?.subtitleTrackIndex > 0)) {
            return <Snow.Text>Waiting on transcode...</Snow.Text>
        }

        if (requestTranscode && !envelope?.isTranscode) {
            return <Snow.Text>Waiting on transcode...</Snow.Text>
        }
    }

    if (!envelope?.videoUrl) {
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