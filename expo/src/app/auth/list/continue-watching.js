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
    const { apiClient } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const [continueWatchingList, setContinueWatchingList] = C.React.useState(null)
    const [tabIndex, setTabIndex] = C.React.useState(0)
    const [tabItems, setTabItems] = C.React.useState([])
    const [resultsEmpty, setResultsEmpty] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!continueWatchingList) {
            apiClient.getContinueWatchingList().then((response) => {
                setContinueWatchingList(response)
                if (response.length) {
                    setTabItems(response[0].items)
                    setTabIndex(0)
                } else {
                    setResultsEmpty(true)
                }
            })
        }
    })

    if (resultsEmpty) {
        return (
            <C.SnowText>
                Snowstream didn't find anything new to watch.
            </C.SnowText>
        )
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
                <C.SnowPosterGrid disableWatched items={tabItems} />
            </C.View>
        )
    }
    return <C.SnowLabel>Loading the continue watching list. This will take a few seconds.</C.SnowLabel>
}

export default ContinueWatchingListPage
