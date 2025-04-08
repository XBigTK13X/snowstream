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

    const onError = (err) => {
        if (props.onError) {
            err.kind = 'rnv'
            props.onError(err)
        }
    }

    return (
        <Video
            source={{ uri: props.videoUrl }}
            ref={videoRef}
            paused={!props.isPlaying}
            controls={false}
            muted={!props.isPlaying}
            onError={onError}
            selectedAudioTrack={{ type: 'index', value: props.audioIndex }}
            selectedTextTrack={{ type: 'index', value: props.subtitleIndex }}
        />
    )
}
