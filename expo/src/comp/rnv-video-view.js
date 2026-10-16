import React from 'react'
import Snow from 'expo-snowui'
import { useVideoPlayer, VideoView } from 'react-native-video'

export default function RnvVideoView(props) {
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
    const subtitleTrackIndex = useHubState((state) => state?.subtitleTrackIndex)
    const seekToSeconds = useHubState((state) => state?.seekToSeconds)

    const [availableTextTracks, setAvailableTextTracks] = React.useState([])

    const styles = {
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

    const safeUrl = videoUrl ? encodeURI(videoUrl) : ''

    const nativePlayer = useVideoPlayer(safeUrl, (instance) => {
        if (!instance) {
            return
        }
        instance.loop = false
        instance.staysActiveInBackground = false
        instance.preservesPitch = true
    })

    const onError = (err) => {
        err.kind = 'rnv'
        emitHubEvent('player.error', err)
    }

    const onRnvEvent = (kind) => {
        return (payload) => {
            emitHubEvent('player.update', {
                kind: 'rnvevent',
                data: {
                    event: kind,
                    data: payload
                }
            })
        }
    }

    const updateAvailableTracks = () => {
        if (!nativePlayer) {
            return
        }
        const textTracks = nativePlayer.getAvailableTextTracks()
        setAvailableTextTracks(textTracks)
    }

    React.useEffect(() => {
        if (!isVideoViewReady) {
            sendHubData({ isVideoViewReady: true, isPlaying: true }, 'player.ready')
            emitHubEvent('player.ready')
        }
    }, [isVideoViewReady, sendHubData, emitHubEvent])

    React.useEffect(() => {
        if (!nativePlayer) {
            return
        }

        if (isPlaying) {
            nativePlayer.play()
        } else {
            nativePlayer.pause()
        }
    }, [isPlaying, nativePlayer])

    React.useEffect(() => {
        if (seekToSeconds > -1 && nativePlayer) {
            nativePlayer.seekTo(seekToSeconds)
        }
    }, [seekToSeconds, nativePlayer])

    React.useEffect(() => {
        if (!nativePlayer) {
            return
        }

        const textTracks = availableTextTracks.length > 0
            ? availableTextTracks
            : nativePlayer.getAvailableTextTracks()

        if (subtitleTrackIndex >= 0) {
            const track = textTracks[subtitleTrackIndex]
            if (track) {
                nativePlayer.selectTextTrack(track)
            }
        } else {
            nativePlayer.selectTextTrack(null)
        }
    }, [nativePlayer, availableTextTracks, subtitleTrackIndex])

    React.useEffect(() => {
        if (!nativePlayer) {
            return
        }

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

    if (!videoUrl) {
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