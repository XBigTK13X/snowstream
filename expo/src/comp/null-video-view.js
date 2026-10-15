import React from 'react'
import Snow from 'expo-snowui'

export default function NullVideoView() {
    const { envelope, updateEnvelope, actions } = Snow.useSnowContext()

    const [lastSeek, setLastSeek] = React.useState(0)
    const progressRef = React.useRef(0)
    const playingRef = React.useRef(envelope?.isPlaying)

    React.useEffect(() => {
        playingRef.current = envelope?.isPlaying
    }, [envelope?.isPlaying])

    React.useEffect(() => {
        if (envelope?.seekToSeconds && envelope.seekToSeconds !== lastSeek) {
            progressRef.current = envelope.seekToSeconds
            actions?.onProgress?.(progressRef.current, 'player-event')
            setLastSeek(envelope.seekToSeconds)
        }

        if (!envelope?.isVideoViewReady) {
            updateEnvelope({ isVideoViewReady: true, isPlaying: true })
            actions?.addLog?.({ kind: 'snowstream', message: 'null video player ready' })
        }
    }, [envelope?.seekToSeconds, envelope?.isVideoViewReady, lastSeek, actions, updateEnvelope])

    React.useEffect(() => {
        const progressInterval = setInterval(() => {
            if (playingRef.current) {
                progressRef.current = progressRef.current + 1
                actions?.onProgress?.(progressRef.current, 'player-event')
            }
        }, 1000)

        return () => {
            clearInterval(progressInterval)
        }
    }, [actions])

    return (
        <Snow.FillView style={{ width: '85%' }}>
            <Snow.Text>The video {envelope?.videoUrl} is {envelope?.isPlaying ? 'playing' : 'paused'}.</Snow.Text>
            <Snow.Text>Here is a whole bunch of text.</Snow.Text>
            <Snow.Text>It makes it easier to see how the transparency controls function.</Snow.Text>
            <Snow.Text>{Snow.stringifySafe(envelope)}</Snow.Text>
        </Snow.FillView>
    )
}