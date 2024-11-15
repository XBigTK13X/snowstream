import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, TVFocusGuideView } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { SnowGrid } from '../../../comp/snow-grid'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

export default function MovieShelfPage() {
    const { signOut, apiClient } = useSession()
    const { routes } = useSettings()
    const localParams = useLocalSearchParams()
    const [shelf, setShelf] = React.useState(null)
    const [seasons, setSeasons] = React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!seasons) {
            apiClient.getSeasonList(showId).then((response) => {
                setSeasons(response)
            })
        }
    })
    if (shelf && seasons) {
        const renderItem = (season, itemIndex) => {
            return (
                <Button
                    hasTVPreferredFocus={itemIndex === 0}
                    key={season.id}
                    title={season.name || `Season ${season.season_order_counter}`}
                    onPress={routes.func(routes.episodeList, { shelfId: shelfId, showId: showId, seasonId: season.id })}
                />
            )
        }
        return (
            <>
                <SnowGrid data={seasons} renderItem={renderItem} />
            </>
        )
    }
    return <Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</Text>
}
