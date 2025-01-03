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
        const renderItem = (item) => {
            let episode = item
            let name = episode.name
            let seasonPad = episode.season.season_order_counter.toString().padStart(2, '0')
            let episodePad = episode.episode_order_counter.toString().padStart(3, '0')
            if (!name) {
                name = `S${seasonPad}E${episodePad}`
            }
            let destination = { shelfId: shelf.id, showId: showId, seasonId: seasonId, episodeId: episode.id }
            return (
                <C.Button
                    hasTVPreferredFocus={item.index === 0}
                    key={episode.id}
                    title={name}
                    onPress={routes.func(routes.episodeDetails, destination)}
                />
            )
        }
        return (
            <>
                <C.SnowGrid data={episodes} renderItem={renderItem} />
            </>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
