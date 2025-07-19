import C from '../../../common'

export default function PlaylistDetailsPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const tagId = localParams.tagId
    const tagName = localParams.tagName

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
                routes.goto(routes.playMedia, { playingQueueSource: response.source })
            })
    }

    const shuffleAll = () => {
        return apiClient
            .getPlayingQueue({ tagId, shuffle: true })
            .then(response => {
                routes.goto(routes.playMedia, { playingQueueSource: response.source })
            })
    }

    return (
        <C.FillView>
            <C.View>
                <C.SnowText>Found {playlistItems.length} items from playlist {tagName}.</C.SnowText>
                <C.SnowGrid itemsPerRow={2}>
                    <C.SnowTextButton title="Watch All" onPress={watchAll} />
                    <C.SnowTextButton title="Shuffle" onPress={shuffleAll} />
                </C.SnowGrid>
            </C.View>
            <C.FillView>
                <C.SnowPosterGrid
                    items={playlistItems}
                    onLongPress={apiClient.toggleItemWatched}
                />
            </C.FillView>
        </C.FillView>
    )
}
