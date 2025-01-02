import C from '../../../common'

export default function MovieShelfPage() {
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
    if (shelf && movie) {
        return (
            <C.Button title="Play" onPress={routes.func(routes.playMedia, { videoFileIndex: 0, movieId: movieId, shelfId: shelfId })} />
        )
    }
    return (
        <C.Text>
            Loading movie {movieId}.
        </C.Text>
    );
}
