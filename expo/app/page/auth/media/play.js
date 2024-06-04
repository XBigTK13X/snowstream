import React from 'react'
import { Dimensions, View, Text, StyleSheet } from "react-native";
import { Button, ListItem } from '@rneui/themed';

import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useSession } from '../../../auth-context';
import { useSettings } from '../../../settings-context';

import { LibmpvVideo } from 'react-native-libmpv';

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoView: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 400,
        height: 800
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
    const [isFullscreen, setFullscreen] = React.useState(false)
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

    if (videoRef && videoRef.current && !isFullscreen) {
        videoRef.current.presentFullscreenPlayer()
        setFullscreen(true)
    }

    if (videoUrl && videoUrl.path) {
        let devVideoUrl = null
        const mkvUrl = "http://192.168.1.20:9064/media/movies/testing/Ocean's Eleven (2001)/Ocean's Eleven (2001) WEBDL-480p.mkv"
        const frigateUrl = "http://192.168.1.20:8000/api/streamable/direct?streamable_id=68"
        const hdHomeRunUrl = "http://192.168.1.20:8000/api/streamable/direct?streamable_id=1"
        const hdHomeRunUrlTrans = "http://192.168.1.20:8000/api/streamable/transcode?streamable_id=1"
        const iptvUrl = "http://192.168.1.20:8000/api/streamable/direct?streamable_id=124"
        devVideoUrl = hdHomeRunUrl
        console.log({ devVideoUrl })
        return (
            <LibmpvVideo style={styles.videoView} playUrl={devVideoUrl ? devVideoUrl : videoUrl.path} />
        )

    }
    return (
        <Text>
            Playing video...
        </Text>
    );
}
