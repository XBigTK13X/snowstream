import React from 'react'
import { Link } from 'expo-router'
import { Dimensions, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'


const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    scrollView: {
        height: windowHeight * .66
    }
});

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
        return (
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} style={styles.scrollView}>
                {streamSource.streamables.map((streamable, streamableIndex) => {
                    return (
                        <Button
                            key={streamable.id}
                            title={streamable.name}
                            onPress={routes.func(routes.playMedia, {
                                streamSourceId: streamSource.id,
                                streamableId: streamable.id,
                            })}
                        />
                    )
                })}
            </ScrollView>
        )
    }
    return <Text>Loading stream source {localParams.streamSourceId}.</Text>
}
