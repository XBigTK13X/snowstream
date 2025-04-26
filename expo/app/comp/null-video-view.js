import React from 'react'
import { View } from 'react-native'
import SnowText from './snow-text'
import SnowButton from './snow-button'


export default function NullVideoView(props) {
    React.useEffect(() => {
        if (!props.isReady && props.onReady) {
            props.onReady()
        }
    })
    return (
        <View>
            <SnowText>The video {props.videoUrl} is {props.isPlaying ? 'playing' : 'paused'}.</SnowText>
        </View>
    )
}