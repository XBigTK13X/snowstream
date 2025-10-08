import PlayMediaPage from './media'

export default function PlayMoviePage() {
    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getMovie(routeParams.movieId, deviceProfile).then((movie) => {
            let videoFileIndex = 0
            if (routeParams.videoFileIndex) {
                videoFileIndex = parseInt(routeParams.videoFileIndex, 10)
            }
            const videoFile = movie.video_files[videoFileIndex]
            return {
                url: videoFile.network_path,
                name: movie.name,
                durationSeconds: videoFile.info.duration_seconds,
                tracks: videoFile.info.tracks
            }
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile, progressSeconds) => {
        return new Promise((resolve) => {
            apiClient.getMovie(routeParams.movieId, deviceProfile)
                .then((movie) => {
                    let videoFileIndex = 0
                    if (routeParams.videoFileIndex) {
                        videoFileIndex = parseInt(routeParams.videoFileIndex, 10)
                    }
                    const videoFile = movie.video_files[videoFileIndex]
                    return apiClient.createVideoFileTranscodeSession(
                        videoFile.id,
                        routeParams.audioTrack,
                        routeParams.subtitleTrack,
                        deviceProfile,
                        progressSeconds ?? routeParams.seekToSeconds
                    )
                        .then((transcodeSession) => {
                            return resolve({
                                name: movie.name,
                                url: transcodeSession.transcode_url,
                                durationSeconds: videoFile.info.duration_seconds,
                                transcodeId: transcodeSession.transcode_session_id
                            })
                        })
                        .catch((err) => {
                            return resolve({
                                error: err
                            })
                        })
                })
        })

    }

    const updateProgress = (apiClient, routeParams, progressSeconds, duration) => {
        return apiClient.setMovieWatchProgress(routeParams.movieId, progressSeconds, duration)
    }

    const increaseWatchCount = (apiClient, routeParams) => {
        return apiClient.increaseMovieWatchCount(routeParams.movieId)
    }
    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            loadTranscode={loadTranscode}
            updateProgress={updateProgress}
            increaseWatchCount={increaseWatchCount}
        />
    )
}
