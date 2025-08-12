import C from '../../../common'

import PlayMediaPage from './media'

export default function PlayEpisodePage() {
    const loadVideo = (apiClient, localParams) => {
        return apiClient.getEpisode(localParams.episodeId).then((response) => {
            const videoFile = response.video_files[localParams.videoFileIndex ?? 0]
            return {
                url: videoFile.network_path,
                name: `${response.season.show.name} - ${C.util.formatEpisodeTitle(response)}`,
                durationSeconds: videoFile.info.duration_seconds,
                tracks: videoFile.info.tracks
            }
        })
    }

    const loadTranscode = (apiClient, localParams, deviceProfile) => {
        return new Promise((resolve) => {
            apiClient.getEpisode(localParams.episodeId)
                .then((episode) => {
                    const videoFile = episode.video_files[localParams.videoFileIndex ?? 0]
                    return apiClient.createVideoFileTranscodeSession(
                        videoFile.id,
                        localParams.audioTrackIndex,
                        localParams.subtitleTrackIndex,
                        deviceProfile
                    )
                        .then((transcodeSession) => {
                            return resolve({
                                name: movie.name,
                                url: transcodeSession.transcode_url,
                                durationSeconds: videoFile.info.duration_seconds
                            })
                        })
                })
        })
    }

    const updateProgress = (apiClient, localParams, progressSeconds, duration) => {
        return apiClient.setEpisodeWatchProgress(episodeId, progressSeconds, duration, countedWatch)
    }

    const increaseWatchCount = (apiClient, localParams) => {
        return apiClient.increaseShowEpisodeWatchCount(episodeId)
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
