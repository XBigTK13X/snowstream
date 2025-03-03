import C from '../../../common'

export default function ShowListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const { setMessageDisplay } = C.useMessageDisplay()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [shows, setShows] = C.React.useState(null)
    const shelfId = localParams.shelfId
    let currentStatus = localParams.watchStatus || 'Unwatched'
    let nextStatus = 'Watched'
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!shows) {
            apiClient.getShowList(shelfId, currentStatus).then((response) => {
                setShows(response)
            })
        }
    })
    if (shelf && shows) {
        const nextWatchedStatus = () => {
            if (currentStatus == 'Unwatched') {
                nextStatus = 'Watched'
            }
            if (currentStatus == 'Watched') {
                nextStatus = 'All'
            }
            if (currentStatus == 'All') {
                nextStatus = 'Unwatched'
            }
            routes.goto(routes.showList, { shelfId: shelf.id, watchStatus: nextStatus })
        }
        const gotoShow = (show) => {
            routes.goto(routes.seasonList, { shelfId: shelf.id, showId: show.id })
        }
        const toggleWatchedShow = (show) => {
            apiClient.toggleShowWatchStatus(show.id).then((watched) => {
                apiClient.getShowList(shelfId, currentStatus).then((response) => {
                    setShows(response)
                    setMessageDisplay(`Mark ${show.name} as ${watched ? 'watched' : 'unwatched'}`)
                })
            })
        }

        return (
            <C.View>
                <C.Button title={"Showing: " + currentStatus} onPress={nextWatchedStatus} />
                <C.SnowPosterGrid onPress={gotoShow} onLongPress={toggleWatchedShow} data={shows} />
            </C.View>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
