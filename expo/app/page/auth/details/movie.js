import C from '../../../common'

export default function MovieDetailsPage() {
    const { signOut, apiClient } = C.useSession();
    const { routes } = C.useSettings();
    const localParams = C.useLocalSearchParams();
    const [shelf, setShelf] = C.React.useState(null);
    const [movie, setMovie] = C.React.useState(null);
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)

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
                if (response.tracks.inspection.scored_tracks['audio'].length) {
                    setAudioTrack(response.tracks.inspection.scored_tracks['audio'][0].relative_index)
                }
                if (response.tracks.inspection.scored_tracks['subtitle'].length) {
                    setSubtitleTrack(response.tracks.inspection.scored_tracks['subtitle'][0].relative_index)
                }
            })
        }
    })
    const setWatchStatus = (status) => {
        apiClient.toggleMovieShelfWatchStatus(movieId)
            .then(() => {
                apiClient.getMovie(movieId).then((response) => {
                    setMovie(response)
                })
            })
    }
    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            setAudioTrack(track.relative_index)
        }
        if (track.kind === 'subtitle') {
            setSubtitleTrack(track.relative_index)
        }
    }
    if (shelf && movie) {
        const watchTitle = movie.watched ? "Set Status to Unwatched" : "Set Status to Watched"
        return (
            <C.View>
                <C.SnowText>Title: {movie.name}</C.SnowText>
                <C.SnowButton title="Play" onPress={routes.func(routes.playMedia, {
                    videoFileIndex: 0,
                    audioTrack: audioTrack,
                    subtitleTrack: subtitleTrack,
                    movieId: movieId,
                    shelfId: shelfId
                })} />
                <C.SnowButton title={watchTitle} onLongPress={setWatchStatus} />
                <C.SnowTrackSelector
                    tracks={movie.tracks.inspection.scored_tracks}
                    selectTrack={selectTrack}
                    audioTrack={audioTrack}
                    subtitleTrack={subtitleTrack}
                />
            </C.View>
        )
    }
    return (
        <C.Text>
            Loading movie {movieId}.
        </C.Text>
    );
}
