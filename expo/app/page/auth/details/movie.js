import C from '../../../common'

export default function MovieDetailsPage() {
    const { apiClient } = C.useSession();
    const { routes } = C.useSettings();
    const localParams = C.useLocalSearchParams();
    const [shelf, setShelf] = C.React.useState(null);
    const [movie, setMovie] = C.React.useState(null);
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const [videoFile, setVideoFile] = C.React.useState(null)

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
                setVideoFile(response.video_files[0])
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
    if (shelf && movie && videoFile) {
        const watchTitle = movie.watched ? "Set Status to Unwatched" : "Set Status to Watched"
        const payload = {
            videoFileIndex: 0,
            audioTrack: audioTrack,
            subtitleTrack: subtitleTrack,
            movieId: movieId,
            shelfId: shelfId
        }
        return (
            <C.View>
                <C.SnowText>Title: {movie.name}</C.SnowText>
                <C.SnowText>Path: {videoFile.network_path}</C.SnowText>
                <C.SnowText>Times Watched: {movie.watch_count ? movie.watch_count.amount : 0}</C.SnowText>
                <C.SnowGrid>
                    <C.SnowTextButton title="Play" onPress={routes.func(routes.playMedia, payload)} />
                    <C.SnowTextButton title={watchTitle} onLongPress={setWatchStatus} />
                    <C.SnowTextButton title={shelf.name} onPress={routes.func(routes.movieList, { shelfId: shelf.id })} />
                    <C.SnowUpdateMediaButton kind="Movie" updateMediaJob={(details) => {
                        apiClient.createJobUpdateMediaFiles({
                            targetScope: 'movie',
                            targetId: movieId,
                            metadataId: details.metadataId,
                            updateMetadata: details.metadata,
                            updateImages: details.images
                        })
                    }} />
                </C.SnowGrid>
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
        <C.SnowText>
            Loading movie {movieId}.
        </C.SnowText>
    );
}
