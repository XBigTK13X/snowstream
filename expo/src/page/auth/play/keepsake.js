import PlayMediaPage from './media'

export default function PlayStreamablePage() {
    const loadVideo = (apiClient, routeParams) => {
        return new Promise((resolve) => {
            return resolve({
                url: routeParams.videoUrl,
                name: routeParams.videoName,
                durationSeconds: routeParams.videoDurationSeconds
            })
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile, initialSeekSeconds) => {
        return new Promise((resolve) => {
            return apiClient.createVideoFileTranscodeSession(
                routeParams.videoFileId,
                0,
                -1,
                deviceProfile,
                initialSeekSeconds ?? 0
            )
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
