import C from '../common'

import Video from 'react-native-video';

var styles = C.StyleSheet.create({
    backgroundVideo: {
        width: 800,
        height: 800
    },
});

export default function WebPlayer(props) {
    const videoRef = C.React.useRef(null);
    const { apiClient } = C.useSession();
    const transcodeUrl = apiClient.getVideoFileTranscodeUrl(props.videoFileId)
    const [isPaused, setIsPaused] = C.React.useState(true)

    const playVideo = () => {
        setIsPaused(false)
    }

    return (
        <C.View style={styles.backgroundVideo}>
            <Video
                source={{ uri: props.forceTranscode ? transcodeUrl : props.videoUrl }}
                ref={videoRef}
                paused={isPaused}
                muted={isPaused}
                onError={(err) => {
                    console.log({ err })
                }}
                style={styles.backgroundVideo}
            />
            <C.SnowButton title="Play Video" onPress={playVideo} />
        </C.View>
    )
}
