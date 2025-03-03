import C from '../../../common'

export default function MovieDetailsPage() {
    const { signOut, apiClient } = C.useSession();
    const { routes } = C.useSettings();
    const localParams = C.useLocalSearchParams();
    const [shelf, setShelf] = C.React.useState(null);
    const [movie, setMovie] = C.React.useState(null);
    const shelfId = localParams.shelfId;
    const movieId = localParams.movieId;
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!movie) {
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
            })
        }
    })
    const setWatchStatus = (status) => {
        apiClient.setMovieWatchStatus(movieId, !movie.watched)
            .then(() => {
                apiClient.getMovie(movieId).then((response) => {
                    setMovie(response)
                })
            })
    }
    if (shelf && movie) {
        const watchTitle = movie.watched ? "Set Status to Unwatched" : "Set Status to Watched"
        return (
            <C.View>
                <C.SnowText>Title: {movie.name}</C.SnowText>
                <C.SnowButton title="Play" onPress={routes.func(routes.playMedia, { videoFileIndex: 0, movieId: movieId, shelfId: shelfId })} />
                <C.SnowButton title={watchTitle} onLongPress={setWatchStatus} />
            </C.View>
        )
    }
    return (
        <C.Text>
            Loading movie {movieId}.
        </C.Text>
    );
}
