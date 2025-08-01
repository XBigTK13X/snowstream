import C from '../../common'

const styles = {
    columns: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    column: {
    }
}

export default function SearchPage() {

    const { apiClient, config } = C.useAppContext()

    const [queryText, setQueryText] = C.React.useState('')
    const [searchResults, setSearchResults] = C.React.useState(null)

    const [tabIndex, setTabIndex] = C.React.useState(0)
    const [tabItems, setTabItems] = C.React.useState([])

    const executeQuery = () => {
        setTabItems([])
        setTabIndex(0)
        apiClient.search(queryText).then(response => {
            setSearchResults(response)
            if (response.length > 0) {
                setTabItems(response[tabIndex].items)
                setTabIndex(0)
            }
        })
    }

    const debouncedSearch = C.useDebouncedCallback(executeQuery, config.debounceMilliseconds)

    const updateQuery = (value) => {
        if (value !== queryText) {
            setQueryText(value)
            debouncedSearch(value)
        }
    }

    const loadTab = (tabEntry, tabIndex) => {
        setTabIndex(tabIndex)
        setTabItems(tabEntry.items)
    }

    let resultsTab = null
    if (searchResults && !searchResults.length) {
        resultsTab = `No results found for [${queryText}].`
    }
    if (searchResults && tabItems) {
        let tabButtons = searchResults.map((entry, entryIndex) => {
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
        resultsTab = (
            <C.FillView>
                <C.View style={styles.columns}>
                    {tabButtons}
                </C.View>
                <C.SnowPosterGrid
                    disableWatched
                    items={tabItems}
                />
            </C.FillView>
        )
    }

    return (
        <C.FillView>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput
                shouldFocus={true}
                value={queryText}
                onValueChange={updateQuery} />
            {resultsTab}
        </C.FillView>
    )
}
