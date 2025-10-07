import { C } from 'snowstream'

export default function LandingPage(props) {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const { SnowStyle } = C.useStyleContext(props)
    const [shelves, setShelves] = C.React.useState(null)
    const [streamSources, setStreamSources] = C.React.useState(null)
    const { setMessageDisplay } = C.useAppContext()
    C.useFocusLayer('landing')


    if (config.debugVideoUrl) {
        //return <C.SnowTextButton title="Debug Video" onPress={routes.func(config.debugVideoUrl)} />
        return <C.Redirect href={config.debugVideoUrl} />
    }

    C.React.useEffect(() => {
        if (!shelves) {
            apiClient.getShelfList().then((response) => {
                setShelves(response)
            }).then(() => {
                apiClient.getStreamSourceList().then((response) => {
                    setStreamSources(response)
                })
            })
        }
    }, [shelves])

    const styles = {
        footer: {
            width: '100%',
            textAlign: 'right',
            color: SnowStyle.color.active
        }
    }

    let destinations = [
        <C.SnowTextButton title="Continue" onPress={routes.func(routes.continueWatching)} />,
        <C.SnowTextButton title="Search" onPress={routes.func(routes.search)} />,
        <C.SnowTextButton title="Playlists" onPress={routes.func(routes.playlistList)} />
    ]

    if (shelves) {
        destinations = destinations.concat(shelves.map((shelf) => {
            if (shelf.kind === 'Movies') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={routes.func(routes.movieList, { shelfId: shelf.id })}
                        onLongPress={() => {
                            apiClient.toggleMovieShelfWatchStatus(shelf.id).then((watched) => {
                                apiClient.getShelfList().then((response) => {
                                    setShelves(response)
                                    setMessageDisplay(`Set shelf ${shelf.name} to ${watched ? 'watched' : 'unwatched'}.`)
                                })
                            })
                        }}
                    />
                )
            } else if (shelf.kind === 'Shows') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={routes.func(routes.showList, { shelfId: shelf.id })}
                        onLongPress={() => {
                            apiClient.toggleShowShelfWatchStatus(shelf.id).then((watched) => {
                                apiClient.getShelfList().then((response) => {
                                    setShelves(response)
                                    setMessageDisplay(`Set shelf ${shelf.name} to ${watched ? 'watched' : 'unwatched'}`)
                                })
                            })
                        }}
                    />
                )
            } else if (shelf.kind === 'Keepsakes') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={routes.func(routes.keepsakeDetails, { shelfId: shelf.id, seekToSeconds: 0 })}
                    />
                )
            }

            return null
        }))
    }

    if (streamSources) {
        destinations = destinations.concat(streamSources.map((streamSource) => {
            return (<C.SnowTextButton
                title={streamSource.name}
                onPress={routes.func(routes.streamableList, {
                    streamSourceId: streamSource.id,
                })}
            />)
        }))
    }

    if (destinations) {
        return (
            <C.View>
                <C.SnowGrid
                    focusStart
                    focusKey="page-entry"
                    items={destinations}
                    itemsPerRow={3} />
                <C.SnowText style={styles.footer} center>{`v${config.clientVersion} - built ${config.clientBuildDate}`}</C.SnowText>
            </C.View>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{apiClient.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
