import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, TVFocusGuideView } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'
import { SimpleGrid } from 'react-native-super-grid'

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
        const renderItem = (item) => {
            let episode = item.item
            let name = episode.name
            if (!name) {
                name = `S${episode.season.season_order_counter.toString().padStart(2, '0')}E${episode.episode_order_counter.toString().padStart(3, '0')}`
            }
            return (
                <TVFocusGuideView>
                    <Button
                        hasTVPreferredFocus={item.index === 0}
                        key={episode.id}
                        title={name}
                        onPress={routes.func(routes.episodeDetails, { shelfId: shelf.id, showId: showId, seasonId: seasonId, episodeId: episode.id })}
                    />
                </TVFocusGuideView>
            )
        }
        return (
            <>
                <SimpleGrid data={episodes} renderItem={renderItem} />
            </>
        )
    }
    return <Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</Text>
}
