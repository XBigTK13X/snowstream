import C from '../../common'

export default function SearchPage() {

    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()

    const [queryText, setQueryText] = C.React.useState('')
    const [searchResults, setSearchResults] = C.React.useState(null)

    const executeQuery = () => {
        apiClient.search(queryText).then(response => {
            setSearchResults(response)
        })
    }

    let grids = null
    if (searchResults) {
        grids = (
            <C.FillView>
                <C.SnowPosterGrid title="Movies" items={searchResults.movies} />
                <C.SnowPosterGrid title="Shows" items={searchResults.shows} />
                <C.SnowScreencapGrid title="Episodes" items={searchResults.episodes} />
            </C.FillView>
        )
    }

    return (
        <C.FillView>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput value={queryText} onChangeText={setQueryText} onSubmit={executeQuery} />
            {grids}
        </C.FillView>
    )
}
