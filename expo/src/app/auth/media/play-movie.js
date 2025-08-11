import PlayMediaPage from './play-media'

export default function PlayMoviePage() {
    const loadVideo = (apiClient, localParams) => {
        apiClient.getMovie(localParams.movieId).then((response) => {
            return {
                videoFile: response.video_files[localParams.videoFileIndex ?? 0],
                name: response.name
            }
        })
    }
    const updateProgress = (apiClient, localParams, progressSeconds, duration) => {
        return apiClient.setMovieWatchProgress(localParams.movieId, progressSeconds, duration)
    }

    const increaseWatchCount = (apiClient, localParams) => {
        return apiClient.increaseMovieWatchCount(localParams.movieId)
    }
    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            updateProgress={updateProgress}
            increaseWatchCount={increaseWatchCount}
        />
    )
}
