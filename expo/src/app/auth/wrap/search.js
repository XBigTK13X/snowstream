import { C, useAppContext } from 'snowstream'

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
    const { apiClient, config, routes, navPush } = useAppContext()

    const [queryText, setQueryText] = C.React.useState('')
    const [searchResults, setSearchResults] = C.React.useState(null)
    const [resultKey, setResultKey] = C.React.useState(null)

    C.useFocusLayer('search')

    const executeQuery = () => {
        apiClient.search(queryText).then(response => {
            setSearchResults(response)
            setResultKey(`query-${queryText}`)
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
                <C.SnowTabs key={resultKey} focusKey="search-results" headers={headers}>
                    {searchResults.map((searchResult, resultIndex) => {
                        if (searchResult.kind === 'streamables') {
                            return <C.SnowGrid items={searchResult.items} renderItem={(item) => {
                                return (
                                    <C.SnowTextButton title={item.name}
                                        onPress={navPush(routes.streamablePlay, {
                                            streamSourceId: item.stream_source.id,
                                            streamableId: item.id,
                                        }, true)}
                                        onLongPress={navPush(routes.streamablePlay, {
                                            streamSourceId: item.stream_source.id,
                                            streamableId: item.id,
                                            forcePlayer: 'exo'
                                        }, true)}
                                    />
                                )
                            }} />
                        }
                        return <C.SnowPosterGrid disableWatched items={searchResult.items} />
                    })}
                </C.SnowTabs>
            )
        }
    }

    return (
        <C.View>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput
                focusStart
                focusKey="page-entry"
                focusDown="search-results"
                value={queryText}
                onValueChange={updateQuery} />
            {resultsTabs}
        </C.View>
    )
}
