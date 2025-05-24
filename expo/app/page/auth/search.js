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

    const pressItem = (item) => {
        if (item.kind === 'movie') {
            routes.goto(routes.movieDetails, {
                shelfId: item.shelf.id,
                movieId: item.id
            })
        }
        else if (item.kind === 'show') {
            routes.goto(routes.seasonList, {
                shelfId: item.shelf.id,
                showId: item.id,
                showName: item.name
            })
        }
        else if (item.kind === 'episode') {
            let destination = {
                shelfId: item.season.show.shelf.id,
                showId: item.season.show.id,
                seasonId: item.season.id,
                episodeId: item.id,
                showName: item.season.show.name,
                seasonOrder: item.season.season_order_counter
            }
            routes.goto(routes.episodeDetails, destination)
        }
    }

    let grids = null
    if (searchResults) {
        grids = (
            <C.View>
                <C.SnowPosterGrid title="Movies" items={searchResults.movies} onPress={pressItem} />
                <C.SnowPosterGrid title="Shows" items={searchResults.shows} onPress={pressItem} />
                <C.SnowThumbGrid title="Episodes" items={searchResults.episodes} onPress={pressItem} />
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
