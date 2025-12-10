import PlayMediaPage from './media'

export default function PlayKeepsakePage() {
    const loadVideo = (apiClient, routeParams) => {
        return new Promise((resolve) => {
            return resolve({
                url: routeParams.videoUrl,
                name: routeParams.videoName,
                durationSeconds: routeParams.videoDurationSeconds
            })
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile, initialSeekSeconds, playerKind) => {
        return new Promise((resolve) => {
            return apiClient.createVideoFileTranscodeSession({
                videoFileId: routeParams.videoFileId,
                audioTrackIndex: 0,
                subtitleTrackIndex: -1,
                deviceProfile: deviceProfile,
                seekToSeconds: initialSeekSeconds ?? 0,
                playerKind: playerKind
            })
                .then((transcodeSession) => {
                    return resolve({
                        name: routeParams.videoName,
                        url: transcodeSession.transcode_url,
                        durationSeconds: routeParams.videoDurationSeconds,
                        transcodeId: transcodeSession.transcode_session_id
                    })
                })
                .catch((err) => {
                    return resolve({
                        error: err
                    })
                })
        })
    }

    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            loadTranscode={loadTranscode}
        />
    )
}
