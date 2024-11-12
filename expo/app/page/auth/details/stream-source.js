import React from 'react'
import { Link } from 'expo-router'
import { Dimensions, View, Text, TouchableOpacity, ScrollView, StyleSheet, TVFocusGuideView } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { SimpleGrid } from 'react-native-super-grid'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    scrollView: {
        height: windowHeight * 0.66,
    },
})

export default function StreamSourcePage() {
    const { apiClient } = useSession()
    const { routes } = useSettings()
    const localParams = useLocalSearchParams()
    const [streamSource, setStreamSource] = React.useState(null)
    React.useEffect(() => {
        if (!streamSource) {
            apiClient.getStreamSource(localParams.streamSourceId).then((response) => {
                setStreamSource(response)
            })
        }
    })

    if (streamSource && streamSource.streamables) {
        const renderItem = (item) => {
            let streamable = item.item
            return (
                <TVFocusGuideView>
                    <Button
                        hasTVPreferredFocus={item.index === 0}
                        key={streamable.id}
                        title={streamable.name}
                        onPress={routes.func(routes.playMedia, {
                            streamSourceId: streamSource.id,
                            streamableId: streamable.id,
                        })}
                    />
                </TVFocusGuideView>
            )
        }
        return (
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} style={styles.scrollView}>
                <SimpleGrid data={streamSource.streamables} renderItem={renderItem} />
            </ScrollView>
        )
    }
    return <Text>Loading stream source {localParams.streamSourceId}.</Text>
}
