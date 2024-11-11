import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

export default function MovieShelfPage() {
    const { signOut, apiClient } = useSession()
    const { routes } = useSettings()
    const localParams = useLocalSearchParams()
    const [shelf, setShelf] = React.useState(null)
    const [episode, setEpisode] = React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    const episodeId = localParams.episodeId
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!episode) {
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
            })
        }
    })
    if (shelf && episode) {
        return <Button title="Play" onPress={routes.func(routes.playMedia, { videoFileIndex: 0, episodeId: episodeId, shelfId: shelfId })} />
    }
    return <Text>Loading episode {episodeId}.</Text>
}
