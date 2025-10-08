import { C } from 'snowstream'

import PlayMediaPage from './media'

export default function PlayEpisodePage() {
    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getEpisode(routeParams.episodeId, deviceProfile).then((episode) => {
            let videoFileIndex = 0
            if (routeParams.videoFileIndex) {
                videoFileIndex = parseInt(routeParams.videoFileIndex, 10)
            }
            const videoFile = episode.video_files[videoFileIndex]
            return {
                url: videoFile.network_path,
                name: `${episode.season.show.name} - ${C.util.formatEpisodeTitle(episode)}`,
                durationSeconds: videoFile.info.duration_seconds,
                tracks: videoFile.info.tracks
            }
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile, progressSeconds) => {
        return new Promise((resolve) => {
            apiClient.getEpisode(routeParams.episodeId, deviceProfile)
                .then((episode) => {
                    let videoFileIndex = 0
                    if (routeParams.videoFileIndex) {
                        videoFileIndex = parseInt(routeParams.videoFileIndex, 10)
                    }
                    const videoFile = episode.video_files[videoFileIndex]
                    return apiClient.createVideoFileTranscodeSession(
                        videoFile.id,
                        routeParams.audioTrack,
                        routeParams.subtitleTrack,
                        deviceProfile,
                        progressSeconds ?? routeParams.seekToSeconds
                    )
                        .then((transcodeSession) => {
                            return resolve({
                                name: episode.name,
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
        return apiClient.setEpisodeWatchProgress(routeParams.episodeId, progressSeconds, duration)
    }

    const increaseWatchCount = (apiClient, routeParams) => {
        return apiClient.increaseShowEpisodeWatchCount(routeParams.episodeId)
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
