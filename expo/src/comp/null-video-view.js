import React from 'react'
import Snow from 'expo-snowui'
import { View } from 'react-native'
import { usePlayerContext } from 'snowstream'

export default function NullVideoView(props) {
    const player = usePlayerContext()
    const [updateInterval, setUpdateInterval] = React.useState(null)
    const [lastSeek, setLastSeek] = React.useState(0)

    const progressRef = React.useRef(0)
    const playingRef = React.useRef(props.isPlaying)
    playingRef.current = props.isPlaying
    React.useEffect(() => {
        if (player?.info?.seekToSeconds && player?.info?.seekToSeconds != lastSeek) {
            progressRef.current = player.info.seekToSeconds
            player.action.onVideoUpdate({
                kind: 'nullevent',
                nullEvent: {
                    progress: progressRef.current
                }
            })
            setLastSeek(player.info.seekToSeconds)
        }
        if (!player?.info?.isReady) {
            player?.action?.onVideoReady()
        }
    }, [player, lastSeek, progressRef])
    React.useEffect(() => {
        if (!updateInterval) {
            const progressInterval = setInterval(() => {
                if (playingRef.current) {
                    progressRef.current = progressRef.current + 1
                    player.action.onVideoUpdate({
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
    console.log({ player })
    return (
        <Snow.FillView style={{ width: '85%' }}>
            <View>
                <Snow.Text>The video {player?.info?.videoUrl} is {player?.info?.isPlaying ? 'playing' : 'paused'}.</Snow.Text>
                <Snow.Text>Here is a whole bunch of text.</Snow.Text>
                <Snow.Text>It makes it easier to see how the transparency controls function.</Snow.Text>
            </View>
            <View>
                <Snow.Text>{JSON.stringify(player?.info, null, 4)}</Snow.Text>
            </View>
        </Snow.FillView>
    )
}