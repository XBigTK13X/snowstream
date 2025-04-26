import C from '../../../common'

export function ContinueWatchingListPage(props) {
    // TODO Have a separate tab for each category.
    // Click a button to load a single poster grid for category
    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const { setMessageDisplay } = C.useMessageDisplay()
    const localParams = C.useLocalSearchParams()
    const [continueWatchingList, setContinueWatchingList] = C.React.useState(null)
    const shelfId = localParams.shelfId
    const [tab, setTab] = C.React.useState(0)
    const [tabItems, setTabItems] = C.React.useState([])
    C.React.useEffect(() => {
        if (!continueWatchingList) {
            apiClient.getContinueWatchingList().then((response) => {
                setContinueWatchingList(response)
                if (response.length) {
                    setTabItems(response[0].items)
                } else {
                    // TODO - Say nothing to continue watching
                }
            })
        }
    })
    const pressItem = (item) => {
        console.log({ item })
    }
    if (continueWatchingList && tabItems) {
        console.log({ tabItems })
        return (
            <C.SnowPosterGrid data={tabItems} onPress={pressItem} />
        )
        return (<C.ScrollView
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            style={{ height: 600 }}>
            {continueWatchingList.map((sublist, sublistIndex) => {
                let gotoItem = null
                let subtitle = null
                if (sublist.kind === 'movies_in_progress') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} Movies in Progress`
                }
                else if (sublist.kind === 'episodes_in_progress') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} Episodes in Progress`
                }
                else if (sublist.kind === 'new_movies') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} New Movies`
                }
                else if (sublist.kind === 'next_episodes') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} Next Episodes`
                }
                else if (sublist.kind === 'new_seasons') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} New Seasons`
                }
                else if (sublist.kind === 'new_shows') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} New Shows`
                }
                return (
                    <C.View key={sublistIndex}>
                        <C.SnowText>{subtitle}</C.SnowText>
                        <C.SnowText></C.SnowText>
                        <C.SnowPosterGrid onPress={gotoItem} data={sublist.items} />
                    </C.View>
                )
            })}
        </ C.ScrollView>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading the continue watching list.</C.Text>
}

export default ContinueWatchingListPage
