import C from '../../../common'

import PlayMediaPage from './play-media'

export default function PlayMoviePage() {
    const loadVideo = (localParams) => {
        apiClient.getMovie(localParams.movieId).then((response) => {
            setMovie(response)
            setMovieId(loadMovieId)
            loadVideoFile(response)
            let title = response.name
            if (playingQueue) {
                title = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${title}`
            }
            setVideoTitle(title)
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
        />
    )
}
