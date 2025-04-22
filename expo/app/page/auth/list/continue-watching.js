import C from '../../../common'

export function ContinueWatchingListPage(props) {
    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const { setMessageDisplay } = C.useMessageDisplay()
    const localParams = C.useLocalSearchParams()
    const [continueWatchingList, setContinueWatchingList] = C.React.useState(null)
    const shelfId = localParams.shelfId
    C.React.useEffect(() => {
        if (!continueWatchingList) {
            apiClient.getContinueWatchingList().then((response) => {
                setContinueWatchingList(response)
            })
        }
    })
    if (continueWatchingList) {
        return (<C.ScrollView
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            style={{ height: 200 }}>
            {continueWatchingList.map((sublist, sublistIndex) => {
                let gotoItem = null
                let subtitle = null
                if (sublist.kind === 'movies_in_progress') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} Movies in Progress`
                }
                if (sublist.kind === 'episodes_in_progress') {
                    gotoItem = () => { }
                    subtitle = `${sublist.items.length} Episodes in Progress`
                }
                return (
                    <C.View key={sublistIndex}>
                        <C.SnowText>{subtitle}</C.SnowText>
                        <C.SnowText></C.SnowText>
                        <C.SnowPosterGrid onPress={gotoItem} data={sublist.items} />
                    </C.View>
                )
            })}
        </C.ScrollView>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading the continue watching list.</C.Text>
}

export default ContinueWatchingListPage
