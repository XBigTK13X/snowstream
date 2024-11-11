import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native'
import { Button, ListItem } from '@rneui/themed'

import { useSession } from '../../auth-context'
import { useSettings } from '../../settings-context'

import { SimpleGrid } from 'react-native-super-grid'

const styles = StyleSheet.create({
    boxContainer: {},
    image: {},
    box: {
        padding: 5,
        margin: 5,
    },
})

export default function LandingPage() {
    const { signOut, apiClient } = useSession()
    const { routes, config } = useSettings()
    const [shelves, setShelves] = React.useState(null)
    const [streamSources, setStreamSources] = React.useState(null)

    React.useEffect(() => {
        if (!shelves) {
            apiClient.getShelves().then((response) => {
                setShelves(response)
            })
        }
        if (!streamSources) {
            apiClient.getStreamSources().then((response) => {
                setStreamSources(response)
            })
        }
    })

    let destinations = []

    if (shelves) {
        destinations = destinations.concat(shelves)
    }

    if (streamSources) {
        destinations = destinations.concat(streamSources)
    }

    if (shelves || streamSources) {
        const renderItem = (item) => {
            item = item.item
            markup = null
            if (item.kind && item.kind === 'Movies') {
                markup = <Button style={styles.box} title={item.name} onPress={routes.func(routes.movieList, { shelfId: item.id })} />
            } else if (item.kind && item.kind === 'Shows') {
                markup = <Button style={styles.box} title={item.name} onPress={routes.func(routes.showList, { shelfId: item.id })} />
            } else {
                markup = (
                    <Button
                        style={styles.box}
                        title={item.name}
                        onPress={routes.func(routes.streamSourceDetails, {
                            streamSourceId: item.id,
                        })}
                    />
                )
            }
            return markup
        }
        return (
            <View>
                <Text>Loaded content from [{config.webApiUrl}]</Text>
                <SimpleGrid itemDimension={130} data={destinations} renderItem={renderItem} />
            </View>
        )
    }

    return (
        <Text>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </Text>
    )
}
