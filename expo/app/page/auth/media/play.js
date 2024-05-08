import React from 'react'
import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';
import { VLCPlayer, VlCPlayerView } from 'react-native-vlc-media-player';
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useSession } from '../../../auth-context';
import { useSettings } from '../../../settings-context';

const calcVLCPlayerHeight = (windowWidth, aspetRatio) => {
    return windowWidth * aspetRatio;
};

// https://github.com/razorRun/react-native-vlc-media-player/issues/186

export default function PlayMediaPage() {
    const { signOut, apiClient } = useSession();
    const { routes } = useSettings();
    const localParams = useLocalSearchParams();

    const [shelf, setShelf] = React.useState(null);
    const [movie, setMovie] = React.useState(null);
    const shelfId = localParams.shelfId;
    const movieId = localParams.movieId;
    const videoFileIndex = localParams.videoFileIndex;
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!movie) {
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
            })
        }
    })
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!movie) {
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
            })
        }
    })
    if (shelf && movie) {
        console.log({ web_path: movie.video_files[videoFileIndex].web_path })
        const webPath = movie.video_files[videoFileIndex].web_path
        return (
            <>
                <VLCPlayer
                    source={{
                        initType: 2,
                        hwDecoderEnabled: 1,
                        hwDecoderForced: 1,
                        uri:
                            webPath,
                        initOptions: [
                            '--no-audio',
                            '--rtsp-tcp',
                            '--network-caching=150',
                            '--rtsp-caching=150',
                            '--no-stats',
                            '--tcp-caching=150',
                            '--realrtsp-caching=150',
                        ],
                    }}
                    autoplay={true}
                    autoAspectRatio={true}
                    resizeMode="cover"
                    // videoAspectRatio={"4:3"}
                    isLive={true}
                    autoReloadLive={true}
                    style={{ height: calcVLCPlayerHeight(Dimensions.get('window').width, 3 / 4), marginTop: 30 }}
                />
            </>
        )

    }
    return (
        <Text>
            Playing video...
        </Text>
    );
}
