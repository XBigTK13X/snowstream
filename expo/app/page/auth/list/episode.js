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
    const [episodes, setEpisodes] = React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!episodes) {
            apiClient.getEpisodeList(seasonId).then((response) => {
                setEpisodes(response)
            })
        }
    })
    if (shelf && episodes) {
        return (
            <>
                {episodes.map((episode) => {
                    let name = episode.name
                    if (!name) {
                        name = `S${episode.season.season_order_counter.toString().padStart(2, '0')}E${episode.episode_order_counter
                            .toString()
                            .padStart(3, '0')}`
                    }
                    return (
                        <Button
                            key={episode.id}
                            title={name}
                            onPress={routes.func(routes.episodeDetails, { shelfId: shelf.id, showId: showId, seasonId: seasonId, episodeId: episode.id })}
                        />
                    )
                })}
            </>
        )
    }
    return <Text>Loading shelf {localParams.shelfId}.</Text>
}
