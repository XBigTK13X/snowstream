import { C, useAppContext } from 'snowstream'

export default function PlaylistDetailsPage() {
    const { apiClient, routes, currentRoute } = useAppContext()

    const tagId = currentRoute.routeParams.tagId
    const tagName = currentRoute.routeParams.tagName

    const [playlistItems, setPlaylistItems] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!playlistItems) {
            apiClient.getPlaylist(tagId).then((response) => {
                setPlaylistItems(response)
            })
        }
    })
    if (!playlistItems) {
        return <C.Text>Loading playlist {tagName}.</C.Text>
    }

    const watchAll = () => {
        return apiClient
            .getPlayingQueue({ tagId })
            .then(response => {
                navPush(routes.playingQueuePlay, {
                    playingQueueSource: response.source
                })
            })
    }

    const shuffleAll = () => {
        return apiClient
            .getPlayingQueue({ tagId, shuffle: true })
            .then(response => {
                navPush(routes.playingQueuePlay, {
                    playingQueueSource: response.source
                })
            })
    }

    return (
        <C.View>
            <C.View>
                <C.SnowText>Found {playlistItems.length} items from playlist {tagName}.</C.SnowText>
                <C.SnowGrid focusKey="page-entry" focusDown="playlist-list" itemsPerRow={2}>
                    <C.SnowTextButton title="Watch All" onPress={watchAll} />
                    <C.SnowTextButton title="Shuffle" onPress={shuffleAll} />
                </C.SnowGrid>
            </C.View>
            <C.View>
                <C.SnowPosterGrid focusStart focusKey="playlist-list" items={playlistItems} />
            </C.View>
        </C.View>
    )
}
