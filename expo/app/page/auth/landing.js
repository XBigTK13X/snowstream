import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, TVFocusGuideView } from 'react-native'
// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import { Button, ListItem } from '@rneui/themed'

import { useSession } from '../../auth-context'
import { useSettings } from '../../settings-context'

import SnowGrid from '../../comp/snow-grid'
import SnowText from '../../comp/snow-text'

const styles = StyleSheet.create({
    boxContainer: {},
    image: {},
    box: {
        padding: 5,
        margin: 5,
        width: '100%',
        height: '100%'
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
        const renderItem = (item, itemIndex) => {
            let destination = item
            markup = null
            if (destination.kind && destination.kind === 'Movies') {
                return (
                    <Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={styles.box}
                        title={destination.name}
                        onPress={routes.func(routes.movieList, { shelfId: destination.id })}
                    />
                )
            } else if (destination.kind && destination.kind === 'Shows') {
                return (
                    <Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={styles.box}
                        title={destination.name}
                        onPress={routes.func(routes.showList, { shelfId: destination.id })}
                    />
                )
            } else {
                return (
                    <Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={styles.box}
                        title={destination.name}
                        onPress={routes.func(routes.streamSourceDetails, {
                            streamSourceId: destination.id,
                        })}
                    />
                )
            }
        }
        return (
            <View >
                <SnowGrid data={destinations} renderItem={renderItem} />
                <SnowText>Loaded content from [{config.webApiUrl}]</SnowText>
            </View>
        )
    }

    return (
        <SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </SnowText>
    )
}
