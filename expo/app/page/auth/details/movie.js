import React from 'react'
import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';
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
        return (
            <Button title="Play" onPress={routes.func(routes.playMedia, { videoFileIndex: 0, movieId: movieId, shelfId: shelfId })} />
        )
    }
    return (
        <Text>
            Loading movie {movieId}.
        </Text>
    );
}
