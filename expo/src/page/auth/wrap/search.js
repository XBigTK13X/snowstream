import { C, useAppContext } from 'snowstream'

export default function SearchPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()

    const [queryText, setQueryText] = C.React.useState('')
    const queryTextRef = C.React.useRef(queryText)
    const [searchResults, setSearchResults] = C.React.useState(null)
    const [resultKey, setResultKey] = C.React.useState(null)

    const executeQuery = (input) => {
        let query = input ?? queryText
        setQueryText(query)
        queryTextRef.current = query
        apiClient.search(query).then(response => {
            if (queryTextRef.current === query) {
                setSearchResults(response)
                setResultKey(`query-${query}`)
            }
        })
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
                                        onPress={navPush({
                                            path: routes.streamablePlay,
                                            params: {
                                                streamSourceId: item.stream_source.id,
                                                streamableId: item.id
                                            }
                                        })}
                                        onLongPress={navPush({
                                            path: routes.streamablePlay,
                                            params: {
                                                streamSourceId: item.stream_source.id,
                                                streamableId: item.id,
                                                forcePlayer: 'exo'
                                            }
                                        })}
                                    />
                                )
                            }} />
                        }
                        if (searchResult.kind === 'keepsake-directories') {
                            return <C.SnowGrid items={searchResult.items} renderItem={(item) => {
                                return (
                                    <C.SnowTextButton title={item.display} onPress={navPush({
                                        path: routes.keepsakeDetails,
                                        params: {
                                            shelfId: item.shelf.id
                                        }
                                    })} />
                                )
                            }} />
                        }
                        if (searchResult.kind === 'keepsake-videos') {
                            return <C.SnowScreencapGrid disableWatched items={searchResult.items} />
                        }
                        return <C.SnowPosterGrid disableWatched items={searchResult.items} />
                    })}
                </C.SnowTabs>
            )
        }
    }

    return (
        <C.SnowGrid itemsPerRow={1}>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput
                focusStart
                focusKey="page-entry"
                focusDown="search-results"
                value={queryText}
                onValueChange={setQueryText}
                onSubmit={executeQuery}
                onDebounce={executeQuery} />
            {resultsTabs}
        </C.SnowGrid>
    )
}
