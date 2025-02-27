import C from '../../../common'

export default function MovieListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [movies, setMovies] = C.React.useState(null)
    const shelfId = localParams.shelfId
    let currentStatus = localParams.watchStatus || 'Unwatched'
    let nextStatus = 'Watched'
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!movies) {
            apiClient.getMovieList(shelfId, currentStatus).then((response) => {
                setMovies(response)
            })
        }
    })
    if (shelf && movies) {
        const nextWatchedStatus = () => {
            if (currentStatus == 'Unwatched') {
                nextStatus = 'Watched'
            }
            if (currentStatus == 'Watched') {
                nextStatus = 'All'
            }
            if (currentStatus == 'All') {
                nextStatus = 'Unwatched'
            }
            routes.goto(routes.movieList, { shelfId: shelf.id, watchStatus: nextStatus })
        }
        const gotoMovie = (movie) => {
            routes.goto(routes.movieDetails, { shelfId: shelf.id, movieId: movie.id })
        }
        return (
            <C.View>
                <C.Button title={"Showing: " + currentStatus} onPress={nextWatchedStatus} />
                <C.SnowPosterGrid onPress={gotoMovie} data={movies} />
            </C.View>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
