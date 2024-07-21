import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

export default function MovieShelfPage() {
    const { signOut, apiClient } = useSession()
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
            <>
                {streamSource.streamables.map((streamable) => {
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
            </>
        )
    }
    return <Text>Loading stream source {localParams.streamSourceId}.</Text>
}
