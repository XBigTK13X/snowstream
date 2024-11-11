import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Button, ListItem, Image } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { SimpleGrid, FlatGrid } from 'react-native-super-grid'

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
        const renderItem = (item) => {
            let show = item.item
            let posterUrl = null
            for (let image of show.image_files) {
                if (image.kind === 'show_poster') {
                    posterUrl = image.web_path
                }
            }
            if (posterUrl) {
                return (
                    <Button
                        title={show.name}
                        icon={<Image style={{ height: 100, width: 50 }} key={show.id} source={{ uri: posterUrl }} />}
                        onPress={routes.func(routes.seasonList, { shelfId: shelf.id, showId: show.id })}
                    />
                )
            }
        }
        return (
            <View>
                <FlatGrid data={shows} renderItem={renderItem} itemDimensions={200} />
            </View>
        )
    }
    return <Text>Loading shelf {localParams.shelfId}.</Text>
}
