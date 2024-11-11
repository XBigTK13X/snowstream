import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

export default function ShowShelfPage() {
    const { signOut, apiClient } = useSession()
    const { routes } = useSettings()
    const localParams = useLocalSearchParams()
    const [shelf, setShelf] = React.useState(null)
    const [shows, setShows] = React.useState(null)
    const shelfId = localParams.shelfId
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!shows) {
            apiClient.getShowList(shelfId).then((response) => {
                setShows(response)
            })
        }
    })
    if (shelf && shows) {
        return (
            <>
                {shows.map((show) => {
                    return <Button key={show.id} title={show.name} onPress={routes.func(routes.seasonList, { shelfId: shelf.id, showId: show.id })} />
                })}
            </>
        )
    }
    return <Text>Loading shelf {localParams.shelfId}.</Text>
}
