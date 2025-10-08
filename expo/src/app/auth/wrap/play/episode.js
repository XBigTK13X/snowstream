import { C } from 'snowstream'

import PlayMediaPage from './media'

export default function PlayEpisodePage() {
    const loadVideo = (apiClient, localParams, deviceProfile) => {
        return apiClient.getEpisode(localParams.episodeId, deviceProfile).then((episode) => {
            let videoFileIndex = 0
            if (localParams.videoFileIndex) {
                videoFileIndex = parseInt(localParams.videoFileIndex, 10)
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

    const loadTranscode = (apiClient, localParams, deviceProfile, progressSeconds) => {
        return new Promise((resolve) => {
            apiClient.getEpisode(localParams.episodeId, deviceProfile)
                .then((episode) => {
                    let videoFileIndex = 0
                    if (localParams.videoFileIndex) {
                        videoFileIndex = parseInt(localParams.videoFileIndex, 10)
                    }
                    const videoFile = episode.video_files[videoFileIndex]
                    return apiClient.createVideoFileTranscodeSession(
                        videoFile.id,
                        localParams.audioTrack,
                        localParams.subtitleTrack,
                        deviceProfile,
                        progressSeconds ?? localParams.seekToSeconds
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

    const updateProgress = (apiClient, localParams, progressSeconds, duration) => {
        return apiClient.setEpisodeWatchProgress(localParams.episodeId, progressSeconds, duration)
    }

    const increaseWatchCount = (apiClient, localParams) => {
        return apiClient.increaseShowEpisodeWatchCount(localParams.episodeId)
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
