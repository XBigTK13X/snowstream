import C from '../../common'

export default function LandingPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [shelves, setShelves] = C.React.useState(null)
    const [streamSources, setStreamSources] = C.React.useState(null)

    C.React.useEffect(() => {
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
                    <C.Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={C.Styles.box}
                        title={destination.name}
                        onPress={routes.func(routes.movieList, { shelfId: destination.id })}
                    />
                )
            } else if (destination.kind && destination.kind === 'Shows') {
                return (
                    <C.Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={C.Styles.box}
                        title={destination.name}
                        onPress={routes.func(routes.showList, { shelfId: destination.id })}
                    />
                )
            } else {
                return (
                    <C.Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={C.Styles.box}
                        title={destination.name}
                        onPress={routes.func(routes.streamSourceDetails, {
                            streamSourceId: destination.id,
                        })}
                    />
                )
            }
        }
        return (
            <C.View >
                <C.SnowGrid data={destinations} renderItem={renderItem} />
                <C.SnowText>Loaded content from [{config.webApiUrl}]</C.SnowText>
            </C.View>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
