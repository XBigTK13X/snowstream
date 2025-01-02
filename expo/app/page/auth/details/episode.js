import C from '../../../common'

export default function MovieShelfPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    const episodeId = localParams.episodeId
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
    if (shelf && episode) {
        return <C.Button title="Play" onPress={routes.func(routes.playMedia, { videoFileIndex: 0, episodeId: episodeId, shelfId: shelfId })} />
    }
    return <C.Text>Loading episode {episodeId}.</C.Text>
}
