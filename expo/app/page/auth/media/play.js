import React from 'react'
import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';
import { VLCPlayer, VlCPlayerView } from 'react-native-vlc-media-player';



import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useSession } from '../../../auth-context';
import { useSettings } from '../../../settings-context';

export default function MovieShelfPage() {
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
        return <VlCPlayerView
            autoplay={true}
            url={movie.video_files[videoFileIndex].web_path}
            ggUrl=""
            showGG={true}
            showTitle={true}
            title="Bee Movie"
            showBack={true}
            onLeftPress={() => { }}
        />
    }
    return (
        <Text>
            Playing video...
        </Text>
    );
}
