import React from 'react'
import { View } from 'react-native'
import SnowText from './snow-text'
import SnowButton from './snow-button'


export default function NullVideoView(props) {
    const [updateInterval, setUpdateInterval] = React.useState(null)
    const [lastSeek, setLastSeek] = React.useState(0)

    const progressRef = React.useRef(0)
    const playingRef = React.useRef(props.isPlaying)
    playingRef.current = props.isPlaying
    React.useEffect(() => {
        if (props.seekToSeconds && props.seekToSeconds != lastSeek) {
            progressRef.current = props.seekToSeconds
            props.onUpdate({
                kind: 'nullevent',
                nullEvent: {
                    progress: progressRef.current
                }
            })
            setLastSeek(props.seekToSeconds)
        }
        if (!props.isReady && props.onReady) {
            props.onReady()
        }
    })
    React.useEffect(() => {
        if (!updateInterval && props.onReady) {
            const progressInterval = setInterval(() => {
                if (playingRef.current) {
                    progressRef.current = progressRef.current + 1
                    props.onUpdate({
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
        <View>
            <SnowText>The video {props.videoUrl} is {props.isPlaying ? 'playing' : 'paused'}.</SnowText>
            <SnowText>Here is a whole bunch of text.</SnowText>
            <SnowText>It makes it easier to see how the transparency controls function.</SnowText>
        </View>
    )
}