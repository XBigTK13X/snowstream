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

    const executeQuery = () => {
        apiClient.search(queryText).then(response => {
            setSearchResults(response)
        })
    }

    const debouncedSearch = C.useDebouncedCallback(executeQuery, config.debounceMilliseconds)

    const updateQuery = (value) => {
        if (value !== queryText) {
            setQueryText(value)
            debouncedSearch(value)
        }
    }

    let resultsTabs = null
    if (searchResults) {
        if (!searchResults.length) {
            resultsTabs = <C.SnowText>No results found for [{queryText}].</C.SnowText>
        }
        else {
            let headers = searchResults.map(searchResult => {
                return `${searchResult.name} [${searchResult.items.length}]`
            })
            resultsTabs = (
                <C.SnowTabs headers={headers}>
                    {searchResults.map(searchResult => {
                        return <C.SnowPosterGrid disableWatched items={searchResult.items} />
                    })}
                </C.SnowTabs>
            )
        }
    }

    return (
        <C.FillView>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput
                shouldFocus={true}
                value={queryText}
                onValueChange={updateQuery} />
            {resultsTabs}
        </C.FillView>
    )
}
