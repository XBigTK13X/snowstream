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

    let movieGrid = null
    let showGrid = null
    let episodeGrid = null

    const pressItem = (item) => {
        if (item.kind === 'movie') {
            routes.goto(routes.movieDetails, {
                shelfId: item.shelf.id,
                movieId: item.id
            })
        }
        if (item.kind === 'show') {
            routes.goto(routes.seasonList, {
                shelfId: item.shelf.id,
                showId: item.id,
                showName: item.name
            })
        }
        if (item.kind === 'episode') {
            let destination = {
                shelfId: item.show.shelf.id,
                showId: item.show.id,
                seasonId: item.season.id,
                episodeId: item.id,
                showName: item.show.name,
                seasonOrder: item.season.season_order_counter
            }
            routes.goto(routes.episodeDetails, destination)
        }
    }

    if (searchResults) {
        if (searchResults.movies && searchResults.movies.length) {
            movieGrid = <C.SnowPosterGrid items={searchResults.movies} onPress={pressItem} />
        }
        if (searchResults.shows && searchResults.shows.length) {
            showGrid = <C.SnowPosterGrid items={searchResults.shows} onPress={pressItem} />
        }
    }

    return (
        <C.View>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput value={queryText} onChangeText={setQueryText} onSubmit={executeQuery} />
            {movieGrid}
            {showGrid}
        </C.View>
    )
}
