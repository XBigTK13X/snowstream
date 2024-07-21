import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { Button, ListItem } from '@rneui/themed'

import { useSession } from '../../auth-context'
import { useSettings } from '../../settings-context'

export default function LandingPage() {
    const { signOut, apiClient } = useSession()
    const { routes } = useSettings()
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

    let shelvesMarkup = <></>
    let streamSourcesMarkup = <></>

    if (shelves) {
        shelvesMarkup = (
            <>
                {shelves.map((shelf) => {
                    let page =
                        shelf.kind == 'Movies'
                            ? routes.movieList
                            : routes.showList
                    return (
                        <Button
                            key={shelf.id}
                            title={shelf.name}
                            onPress={routes.func(page, { shelfId: shelf.id })}
                        />
                    )
                })}
            </>
        )
    }

    if (streamSources) {
        streamSourcesMarkup = (
            <>
                {streamSources.map((streamSource) => {
                    return (
                        <Button
                            key={streamSource.id}
                            title={streamSource.name}
                            onPress={routes.func(routes.streamSourceDetails, {
                                streamSourceId: streamSource.id,
                            })}
                        />
                    )
                })}
            </>
        )
    }

    if (shelves || streamSources) {
        return (
            <>
                {shelvesMarkup}
                {streamSourcesMarkup}
            </>
        )
    }

    return <Text>Loading shelves and stream sources...</Text>
}
