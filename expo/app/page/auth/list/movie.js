import C from '../../../common'

export default function MovieListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [movies, setMovies] = C.React.useState(null)
    const shelfId = localParams.shelfId
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!movies) {
            apiClient.getMovieList(shelfId).then((response) => {
                setMovies(response)
            })
        }
    })
    if (shelf && movies) {
        const gotoMovie = (movie) => {
            routes.goto(routes.movieDetails, { shelfId: shelf.id, movieId: movie.id })
        }
        return <C.SnowPosterGrid onPress={gotoMovie} data={movies} />
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
