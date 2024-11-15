import React from 'react'
import { Link } from 'expo-router'
import { Dimensions, View, Text, TouchableOpacity, ScrollView, StyleSheet, TVFocusGuideView } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { SnowGrid } from '../../../comp/snow-grid'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

//TODO This should be a streamable list page, not stream source details
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
        const renderItem = (streamable, itemIndex) => {
            return (
                <Button
                    hasTVPreferredFocus={itemIndex === 0}
                    key={streamable.id}
                    title={streamable.name}
                    onPress={routes.func(routes.playMedia, {
                        streamSourceId: streamSource.id,
                        streamableId: streamable.id,
                    })}
                />
            )
        }
        return (
            <SnowGrid data={streamSource.streamables} renderItem={renderItem} />
        )
    }
    return <Text>Loading stream source {localParams.streamSourceId}.</Text>
}
