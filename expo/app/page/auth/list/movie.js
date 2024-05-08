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
    const [shelf, setShelf] = React.useState(null)
    const [movies, setMovies] = React.useState(null)
    const shelfId = localParams.shelfId
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!movies) {
            apiClient.getMovieList(shelfId).then((response) => {
                setMovies(response)
            })
        }
    })
    if (shelf && movies) {
        return (<>
            {movies.map((movie) => {
                return (
                    <Button key={movie.id} title={movie.name} onPress={routes.func(routes.movieDetails, { shelfId: shelf.id, movieId: movie.id })} />
                )
            })}
        </>
        )
    }
    return (
        <Text>
            Loading shelf {localParams.shelfId}.
        </Text>
    );
}
