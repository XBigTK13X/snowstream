import { StyleSheet, View } from 'react-native'

import Video, { VideoRef } from 'react-native-video';

var styles = StyleSheet.create({
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default function WebPlayer(props) {
    const videoRef = useRef < VideoRef > (null);

    return (
        <Video
            // Can be a URL or a local file.
            source={props.videoUrl}
            // Store reference  
            ref={videoRef}
            // Callback when remote video is buffering                                      
            //onBuffer={onBuffer}
            // Callback when video cannot be loaded              
            //onError={onError}
            style={styles.backgroundVideo}
        />
    )
}
