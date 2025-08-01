import C from '../../../common'

const styles = {
    columns: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    column: {
    }
}

export function ContinueWatchingListPage(props) {
    const { apiClient } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const [continueWatchingList, setContinueWatchingList] = C.React.useState(null)
    const [tabIndex, setTabIndex] = C.React.useState(0)
    const [tabKind, setTabKind] = C.React.useState(null)
    const [tabItems, setTabItems] = C.React.useState([])
    const [resultsEmpty, setResultsEmpty] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!continueWatchingList) {
            apiClient.getContinueWatchingList().then((response) => {
                setContinueWatchingList(response)
                if (response.length) {
                    setTabItems(response[0].items)
                    setTabKind(response[0].kind)
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
        setTabKind(tabEntry.kind)
        setTabItems(tabEntry.items)
    }
    if (continueWatchingList && tabItems) {
        let tabButtons = continueWatchingList.map((entry, entryIndex) => {
            const selected = entryIndex === tabIndex
            const tabTitle = `${entry.name} [${entry.items.length}]`
            return (
                <C.SnowTextButton
                    key={entryIndex}
                    selected={selected}
                    style={styles.column}
                    onPress={() => { loadTab(entry, entryIndex) }}
                    title={tabTitle} />
            )
        })
        const markWatched = (item) => {
            if (tabKind === 'in_progress') {
                if (item.model_kind === 'movie') {
                    return apiClient.setItemWatched(item)
                }
                else if (item.model_kind === 'show_episode') {
                    return apiClient.setItemWatched(item)
                }
            }
            else if (tabKind === 'new_shows') {
                return apiClient.setItemWatched({ id: item.season.show.id, model_kind: 'show' })
            }
            else if (tabKind === 'new_seasons') {
                return apiClient.setItemWatched({ id: item.season.id, model_kind: 'show_season' })
            }
            else if (tabKind === 'next_episodes') {
                return apiClient.setItemWatched(item)
            }
            else if (tabKind === 'new_movies') {
                return apiClient.setItemWatched(item)
            }
        }
        return (
            <C.FillView>
                <C.View style={styles.columns}>
                    {tabButtons}
                </C.View>
                <C.SnowPosterGrid
                    disableWatched
                    items={tabItems}
                    onLongPress={markWatched}
                />
            </C.FillView>
        )
    }
    return <C.SnowLabel>Loading the continue watching list. This will take a few seconds.</C.SnowLabel>
}

export default ContinueWatchingListPage
