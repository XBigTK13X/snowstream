import C from '../../../common'

export default function ShowListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [shows, setShows] = C.React.useState(null)
    const shelfId = localParams.shelfId
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!shows) {
            apiClient.getShowList(shelfId).then((response) => {
                setShows(response)
            })
        }
    })
    if (shelf && shows) {
        const gotoShow = (show) => {
            console.log({ show })
            routes.goto(routes.seasonList, { shelfId: shelf.id, showId: show.id })
        }
        return (
            <C.View>
                <C.SnowPosterGrid onPress={gotoShow} data={shows} />
            </C.View>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
