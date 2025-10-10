import { C, useAppContext } from 'snowstream'

export default function LandingPage(props) {
    const { apiClient, routes, config } = useAppContext()
    const { SnowStyle, navPush } = C.useSnowContext(props)
    const [shelves, setShelves] = C.React.useState(null)
    const [streamSources, setStreamSources] = C.React.useState(null)

    C.React.useEffect(() => {
        if (config.debugVideoUrl) {
            parts = config.debugVideoUrl.split('?')
            navPush(parts[0], C.util.queryToObject(parts[1]))
        }
    }, [config])

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

    if (config.debugVideoUrl) {
        return null
    }

    const styles = {
        footer: {
            width: '100%',
            textAlign: 'right',
            color: SnowStyle.color.active
        }
    }

    let destinations = [
        <C.SnowTextButton title="Continue" onPress={navPush(routes.continueWatching, true)} />,
        <C.SnowTextButton title="Search" onPress={navPush(routes.search, true)} />,
        <C.SnowTextButton title="Playlists" onPress={navPush(routes.playlistList, true)} />
    ]

    if (shelves) {
        destinations = destinations.concat(shelves.map((shelf) => {
            if (shelf.kind === 'Movies') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={navPush(routes.movieList, { shelfId: shelf.id }, true)}
                        onLongPress={() => {
                            apiClient.toggleMovieShelfWatchStatus(shelf.id).then((watched) => {
                                apiClient.getShelfList().then((response) => {
                                    setShelves(response)
                                })
                            })
                        }}
                    />
                )
            } else if (shelf.kind === 'Shows') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={
                            navPush(routes.showList, { shelfId: shelf.id }, true)
                        }
                        onLongPress={() => {
                            apiClient.toggleShowShelfWatchStatus(shelf.id).then((watched) => {
                                apiClient.getShelfList().then((response) => {
                                    setShelves(response)
                                })
                            })
                        }
                        }
                    />
                )
            } else if (shelf.kind === 'Keepsakes') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={navPush(routes.keepsakeDetails, { shelfId: shelf.id, seekToSeconds: 0 }, true)}
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
                onPress={navPush(routes.streamableList, {
                    streamSourceId: streamSource.id
                }, true)}
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
