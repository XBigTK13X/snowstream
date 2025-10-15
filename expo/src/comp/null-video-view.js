import React from 'react'
import Snow from 'expo-snowui'
import { Player } from 'snowstream'

export default function NullVideoView() {
    const player = Player.useSnapshot(Player.state)

    const [updateInterval, setUpdateInterval] = React.useState(null)
    const [lastSeek, setLastSeek] = React.useState(0)

    const progressRef = React.useRef(0)
    const playingRef = React.useRef(player.isPlaying)
    React.useEffect(() => {
        if (player.seekToSeconds && player.seekToSeconds != lastSeek) {
            progressRef.current = player.seekToSeconds
            Player.action.onVideoUpdate({
                kind: 'nullevent',
                nullEvent: {
                    progress: progressRef.current
                }
            })
            setLastSeek(player.seekToSeconds)
        }
        if (!player.isReady) {
            Player.action.onVideoReady()
        }
    }, [player, lastSeek, progressRef])
    React.useEffect(() => {
        if (!updateInterval) {
            const progressInterval = setInterval(() => {
                if (playingRef.current) {
                    progressRef.current = progressRef.current + 1
                    Player.action.onVideoUpdate({
                        kind: 'nullevent',
                        nullEvent: {
                            progress: progressRef.current
                        }
                    })
                }
            }, 1000)
            setUpdateInterval(progressInterval)
            return () => {
                clearInterval(progressInterval)
            }
        }
    }, [])
    return (
        <Snow.FillView style={{ width: '85%' }}>
            <Snow.Text>The video {player.videoUrl} is {player.isPlaying ? 'playing' : 'paused'}.</Snow.Text>
            <Snow.Text>Here is a whole bunch of text.</Snow.Text>
            <Snow.Text>It makes it easier to see how the transparency controls function.</Snow.Text>
            <Snow.Text>{Snow.stringifySafe(player)}</Snow.Text>
        </Snow.FillView>
    )
}