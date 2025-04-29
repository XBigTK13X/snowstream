import C from '../../../common'

const styles = {
    columns: {
        flexBasis: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        flex: 1
    },
    column: {
        flex: 3,
        flexBasis: '33%'
    }
}

export function ContinueWatchingListPage(props) {
    // TODO Have a separate tab for each category.
    // Click a button to load a single poster grid for category
    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const { setMessageDisplay } = C.useMessageDisplay()
    const localParams = C.useLocalSearchParams()
    const [continueWatchingList, setContinueWatchingList] = C.React.useState(null)
    const shelfId = localParams.shelfId
    const [tabIndex, setTabIndex] = C.React.useState(0)
    const [tabItems, setTabItems] = C.React.useState([])
    C.React.useEffect(() => {
        if (!continueWatchingList) {
            apiClient.getContinueWatchingList().then((response) => {
                setContinueWatchingList(response)
                if (response.length) {
                    setTabItems(response[0].items)
                    setTabIndex(0)
                } else {
                    // TODO - Say nothing to continue watching
                }
            })
        }
    })
    const pressItem = (item) => {
        if (item.kind === 'movie') {
            routes.goto(routes.movieDetails, {
                shelfId: item.shelf.id,
                movieId: item.id
            })
        }
        if (item.kind === 'episode') {
            let destination = {
                shelfId: item.show.shelf.id,
                showId: item.show.id,
                seasonId: item.season.id,
                episodeId: item.id,
                showName: item.show.name,
                seasonOrder: item.season.season_order_counter
            }
            routes.goto(routes.episodeDetails, destination)
        }
    }
    const loadTab = (tabEntry, tabIndex) => {
        setTabIndex(tabIndex)
        setTabItems(tabEntry.items)
    }
    if (continueWatchingList && tabItems) {
        let tabButtons = continueWatchingList.map((entry, entryIndex) => {
            const selected = entryIndex === tabIndex
            return (
                <C.SnowTextButton
                    key={entryIndex}
                    selected={selected}
                    style={styles.column}
                    onPress={() => { loadTab(entry, entryIndex) }}
                    title={entry.name} />
            )
        })
        return (
            <C.View>
                <C.View style={styles.columns}>
                    {tabButtons}
                </C.View>
                <C.SnowPosterGrid data={tabItems} onPress={pressItem} />
            </C.View>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading the continue watching list.</C.Text>
}

export default ContinueWatchingListPage
