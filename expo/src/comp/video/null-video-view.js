import React from 'react'
import Snow from '@snowsuite/expo-snowui'

export default function NullVideoView() {
    const {
        sendHubData,
        emitHubEvent,
        useHubState,
        getHubState
    } = Snow.useSnowContext()

    const videoUrl = useHubState((state) => state?.videoUrl)
    const isPlaying = useHubState((state) => state?.isPlaying)
    const isVideoViewReady = useHubState((state) => state?.isVideoViewReady)
    const seekToSeconds = useHubState((state) => state?.seekToSeconds)

    const [lastSeek, setLastSeek] = React.useState(0)
    const progressRef = React.useRef(0)
    const playingRef = React.useRef(isPlaying)

    React.useEffect(() => {
        playingRef.current = isPlaying
    }, [isPlaying])

    React.useEffect(() => {
        if (seekToSeconds && seekToSeconds !== lastSeek) {
            progressRef.current = seekToSeconds
            emitHubEvent('player.progress', {
                seconds: progressRef.current,
                source: 'player-event'
            })
            setLastSeek(seekToSeconds)
        }

        if (!isVideoViewReady) {
            sendHubData({ isVideoViewReady: true, isPlaying: true }, 'player.ready')
            emitHubEvent('player.ready')
        }
    }, [seekToSeconds, isVideoViewReady, lastSeek, sendHubData, emitHubEvent])

    React.useEffect(() => {
        const progressInterval = setInterval(() => {
            if (playingRef.current) {
                progressRef.current = progressRef.current + 1
                emitHubEvent('player.progress', {
                    seconds: progressRef.current,
                    source: 'player-event'
                })
            }
        }, 1000)

        return () => {
            clearInterval(progressInterval)
        }
    }, [emitHubEvent])

    const hubState = getHubState()

    return (
        <Snow.FillView style={{ width: '85%' }}>
            <Snow.Text>The video {videoUrl} is {isPlaying ? 'playing' : 'paused'}.</Snow.Text>
            <Snow.Text>Here is a whole bunch of text.</Snow.Text>
            <Snow.Text>It makes it easier to see how the transparency controls function.</Snow.Text>
            <Snow.Text>{Snow.stringifySafe(hubState)}</Snow.Text>
        </Snow.FillView>
    )
}