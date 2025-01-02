import C from '../../../common'

export default function MovieShelfPage() {
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
        const renderItem = (movie, itemIndex) => {
            return (
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    key={movie.id}
                    title={movie.name}
                    onPress={routes.func(routes.movieDetails, { shelfId: shelf.id, movieId: movie.id })}
                />
            )
        }
        return <C.SnowGrid data={movies} renderItem={renderItem} />
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
