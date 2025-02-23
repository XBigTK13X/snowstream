import C from '../../../common'

export default function EpisodeListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [episodes, setEpisodes] = C.React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!episodes) {
            apiClient.getEpisodeList(seasonId).then((response) => {
                setEpisodes(response)
            })
        }
    })
    if (shelf && episodes) {
        const gotoEpisode = (episode) => {
            let destination = { shelfId: shelf.id, showId: showId, seasonId: seasonId, episodeId: episode.id }
            routes.goto(routes.episodeDetails, destination)
        }
        return <C.SnowThumbGrid onPress={gotoEpisode} data={episodes} itemTitle={apiClient.formatEpisodeTitle} />
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
