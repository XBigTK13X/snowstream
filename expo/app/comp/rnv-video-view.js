import React from 'react'
import Video from 'react-native-video';
import { View } from 'react-native'
import SnowText from './snow-text'
import SnowButton from './snow-button'

export default function RnvVideoView(props) {
    const videoRef = React.useRef(null);
    const [userPlayed, setUserPlayed] = React.useState(false)

    // Workaround for web not allowing videos to autoplay
    const userClickedPlay = () => {
        props.onReady()
        setUserPlayed(true)
    }

    if (!userPlayed) {
        return (
            <View style={{ backgroundColor: 'black', height: props.windowHeight }}>
                <SnowButton title="Web requires this button be pressed" onPress={userClickedPlay} />
            </View>
        )
    }

    return (
        <Video
            source={{ uri: props.videoUrl }}
            ref={videoRef}
            paused={!props.isPlaying}
            controls={false}
            muted={!props.isPlaying}
            onError={(err) => {
                if (props.onError) {
                    props.onError(err)
                }
            }}
        />
    )
}
