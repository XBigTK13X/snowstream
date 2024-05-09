import React from 'react'
import { View, Text, StyleSheet } from "react-native";
import { Button, ListItem } from '@rneui/themed';

import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useSession } from '../../../auth-context';
import { useSettings } from '../../../settings-context';

import Video, { VideoRef } from 'react-native-video';

var styles = StyleSheet.create({
    backgroundVideo: {
        width: 400,
        height: 400,
    },
    videoView: {
        width: 400,
        height: 400
    }
});

// https://thewidlarzgroup.github.io/react-native-video#v600-information

export default function PlayMediaPage() {
    const videoRef = React.useRef(null);
    const { signOut, apiClient } = useSession();
    const { routes } = useSettings();
    const localParams = useLocalSearchParams();

    const [shelf, setShelf] = React.useState(null);
    const [movie, setMovie] = React.useState(null);
    const [videoUrl, setVideoUrl] = React.useState(null);
    const shelfId = localParams.shelfId;
    const movieId = localParams.movieId;
    const videoFileIndex = localParams.videoFileIndex;

    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
                const webPath = response.video_files[videoFileIndex].web_path
                setVideoUrl({ path: webPath })
            })
        }
    })

    if (videoUrl && videoUrl.path) {
        console.log({ videoUrl, videoRef })
        return (
            <View style={styles.videoView}>
                <Video
                    ref={videoRef}
                    paused={false}
                    source={{ uri: videoUrl.path }}
                    style={styles.backgroundVideo}
                    onError={(err) => {
                        // Error Code - 22000 - IO_UNSPECIFIED, codec issue?
                        console.log({ err })
                    }}
                    onBuffer={(buffer) => {
                        console.log({ buffer })
                    }}
                    controls={true}
                    resizeMode="contain"
                />
            </View>
        )

    }
    return (
        <Text>
            Playing video...
        </Text>
    );
}
