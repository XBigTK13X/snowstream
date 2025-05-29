import C from '../../common'

export default function SearchPage() {

    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()

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
            <C.View>
                <C.SnowPosterGrid title="Movies" items={searchResults.movies} />
                <C.SnowPosterGrid title="Shows" items={searchResults.shows} />
                <C.SnowThumbGrid title="Episodes" items={searchResults.episodes} />
            </C.View>
        )
    }

    return (
        <C.View>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput value={queryText} onChangeText={setQueryText} onSubmit={executeQuery} />
            {grids}
        </C.View>
    )
}
