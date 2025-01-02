import C from '../../../common'

export default function MovieShelfPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [seasons, setSeasons] = C.React.useState(null)
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!seasons) {
            apiClient.getSeasonList(showId).then((response) => {
                setSeasons(response)
            })
        }
    })
    if (shelf && seasons) {
        const renderItem = (season, itemIndex) => {
            return (
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    key={season.id}
                    title={season.name || `Season ${season.season_order_counter}`}
                    onPress={routes.func(routes.episodeList, { shelfId: shelfId, showId: showId, seasonId: season.id })}
                />
            )
        }
        return (
            <>
                <C.SnowGrid data={seasons} renderItem={renderItem} />
            </>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
