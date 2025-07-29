import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import SnowText from './snow-text'
import Style from '../snow-style'


export default function NullVideoView(props) {
    const styles = {
        touchable: {
            width: Style.window.width(),
            height: Style.window.height(),
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        wrapper: {
            width: Style.window.width(),
            height: Style.window.height(),
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
            width: Style.window.width(),
            height: Style.window.height(),
            position: 'absolute',
            alignSelf: 'center',
            backgroundColor: 'black',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
    }
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
            <TouchableOpacity
                hasTVPreferredFocus={props.shouldFocus}
                style={styles.touchable}
                onPress={props.pauseVideo}>
                <SnowText>The video {props.videoUrl} is {props.isPlaying ? 'playing' : 'paused'}.</SnowText>
                <SnowText>Here is a whole bunch of text.</SnowText>
                <SnowText>It makes it easier to see how the transparency controls function.</SnowText>
                <SnowText>{JSON.stringify(props, null, 4)}</SnowText>
            </TouchableOpacity>
        </View>
    )
}