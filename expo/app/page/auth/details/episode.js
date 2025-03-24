import C from '../../../common'

export default function EpisodeDetailsPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    const episodeId = localParams.episodeId
    const seasonOrder = localParams.seasonOrder
    const showName = localParams.showName
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!episode) {
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
            })
        }
    })
    const setWatchStatus = (status) => {
        apiClient.setEpisodeWatchStatus(episodeId, !episode.watched).then(() => {
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
            })
        })
    }
    if (shelf && episode) {
        const watchTitle = episode.watched ? 'Set Status to Unwatched' : 'Set Status to Watched'
        return (
            <C.View>
                <C.SnowText>
                    {showName} season {seasonOrder} episode {apiClient.formatEpisodeTitle(episode)}
                </C.SnowText>
                <C.SnowButton
                    title="Play"
                    onPress={routes.func(routes.playMedia, { videoFileIndex: 0, episodeId: episodeId, shelfId: shelfId })}
                />
                <C.SnowButton title={watchTitle} onLongPress={setWatchStatus} />
            </C.View>
        )
    }
    return <C.Text>Loading episode {episodeId}.</C.Text>
}
