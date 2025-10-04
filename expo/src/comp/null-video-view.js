import React from 'react'
import Snow from 'expo-snowui'
import { TouchableOpacity, View } from 'react-native'
import { usePlayerContext } from '../player-context'

export default function NullVideoView(props) {
    const { getWindowWidth, getWindowHeight } = Snow.useStyleContext(props)
    const player = usePlayerContext()
    const [updateInterval, setUpdateInterval] = React.useState(null)
    const [lastSeek, setLastSeek] = React.useState(0)

    const progressRef = React.useRef(0)
    const playingRef = React.useRef(props.isPlaying)
    playingRef.current = props.isPlaying
    React.useEffect(() => {
        if (player.info.seekToSeconds && player.info.seekToSeconds != lastSeek) {
            progressRef.current = player.info.seekToSeconds
            player.action.onVideoUpdate({
                kind: 'nullevent',
                nullEvent: {
                    progress: progressRef.current
                }
            })
            setLastSeek(player.info.seekToSeconds)
        }
        if (!player.info.isReady) {
            player.action.onVideoReady()
        }
    })
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
    return (
        <Snow.Modal
            assignFocus={false}
            onRequestClose={() => { player.action.onStopVideo() }}
        >
            <Snow.FillView style={{ width: '85%' }}>
                <View>
                    <Snow.Text>The video {player.info.videoUrl} is {player.info.isPlaying ? 'playing' : 'paused'}.</Snow.Text>
                    <Snow.Text>Here is a whole bunch of text.</Snow.Text>
                    <Snow.Text>It makes it easier to see how the transparency controls function.</Snow.Text>
                </View>
                <View>
                    <Snow.Text>{JSON.stringify(player.info, null, 4)}</Snow.Text>
                </View>
            </Snow.FillView>
            <Snow.Overlay
                transparent
                focusStart
                focusKey="null-video"
                focusLayer="null-video"
                onPress={player.action.onPauseVideo}>
            </Snow.Overlay>
        </Snow.Modal>
    )
}