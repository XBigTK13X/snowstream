import { C, useAppContext } from 'snowstream'
import Snow from 'expo-snowui'

export default function LandingPage(props) {
    const { apiClient, routes, config } = useAppContext()
    const { SnowStyle, navPush } = C.useSnowContext(props)
    const [shelves, setShelves] = C.React.useState(null)
    const [streamSources, setStreamSources] = C.React.useState(null)

    C.React.useEffect(() => {
        if (config.debugVideoUrl) {
            const parts = config.debugVideoUrl.split('?')
            navPush(parts[0], Snow.queryToObject(parts[1]))
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
        <C.SnowTextButton title="Continue" onPress={navPush({ path: routes.continueWatching })} />,
        <C.SnowTextButton title="Search" onPress={navPush({ path: routes.search })} />,
        <C.SnowTextButton title="Playlists" onPress={navPush({ path: routes.playlistList })} />
    ]

    if (shelves) {
        destinations = destinations.concat(shelves.map((shelf) => {
            if (shelf.kind === 'Movies') {
                return (
                    <C.SnowTextButton
                        title={shelf.name}
                        onPress={navPush({ path: routes.movieList, params: { shelfId: shelf.id } })}
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
                            navPush({ path: routes.showList, params: { shelfId: shelf.id } })
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
                        onPress={navPush({
                            path: routes.keepsakeDetails,
                            params: { shelfId: shelf.id, seekToSeconds: 0 }
                        })}
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
                onPress={navPush({
                    path: routes.streamableList,
                    params: { streamSourceId: streamSource.id }
                })}
            />)
        }))
    }

    if (destinations) {
        return (
            <>
                <C.SnowGrid
                    focusStart
                    focusKey="page-entry"
                    items={destinations}
                    itemsPerRow={3} />
                <C.SnowText style={styles.footer} center>{`v${config.clientVersion} - built ${config.clientBuildDate}`}</C.SnowText>
            </>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{apiClient.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
