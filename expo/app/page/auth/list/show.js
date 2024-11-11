import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Button, ListItem, Image } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

const style = StyleSheet.create({
    list: {
        width: '100%',
        backgroundColor: '#000',
    },
    item: {
        aspectRatio: 1,
        width: '100%',
        flex: 1,
    },
})

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
                    let posterUrl = null
                    for (let image of show.image_files) {
                        if (image.kind === 'show_poster') {
                            posterUrl = image.web_path
                        }
                    }
                    if (posterUrl) {
                        console.log({ posterUrl })
                        return (
                            <Image
                                containerStyle={style.item}
                                key={show.id}
                                source={{ uri: posterUrl }}
                                onPress={routes.func(routes.seasonList, { shelfId: shelf.id, showId: show.id })}
                            />
                        )
                    }
                    return <Button key={show.id} title={show.name} onPress={routes.func(routes.seasonList, { shelfId: shelf.id, showId: show.id })} />
                })}
            </>
        )
    }
    return <Text>Loading shelf {localParams.shelfId}.</Text>
}
