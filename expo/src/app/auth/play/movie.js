import PlayMediaPage from './media'

export default function PlayMoviePage() {
    const loadVideo = (apiClient, localParams) => {

        return apiClient.getMovie(localParams.movieId).then((movie) => {
            let videoFileIndex = 0
            if (localParams.videoFileIndex) {
                videoFileIndex = parseInt(localParams.videoFileIndex, 10)
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

    const loadTranscode = (apiClient, localParams, deviceProfile, progressSeconds) => {
        return new Promise((resolve) => {
            apiClient.getMovie(localParams.movieId)
                .then((movie) => {
                    let videoFileIndex = 0
                    if (localParams.videoFileIndex) {
                        videoFileIndex = parseInt(localParams.videoFileIndex, 10)
                    }
                    const videoFile = movie.video_files[videoFileIndex]
                    return apiClient.createVideoFileTranscodeSession(
                        videoFile.id,
                        localParams.audioTrack,
                        localParams.subtitleTrack,
                        deviceProfile,
                        progressSeconds ?? localParams.seekToSeconds
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

    const updateProgress = (apiClient, localParams, progressSeconds, duration) => {
        return apiClient.setMovieWatchProgress(localParams.movieId, progressSeconds, duration)
    }

    const increaseWatchCount = (apiClient, localParams) => {
        return apiClient.increaseMovieWatchCount(localParams.movieId)
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
