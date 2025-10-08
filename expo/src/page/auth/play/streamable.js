import PlayMediaPage from './media'

export default function PlayStreamablePage() {
    const loadVideo = (apiClient, routeParams) => {
        return apiClient.getStreamable(routeParams.streamableId).then((response) => {
            return {
                url: response.url,
                name: response.name,
                durationSeconds: response.duration_seconds
            }
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getStreamable(routeParams.streamableId)
            .then((streamable) => {
                return apiClient.createStreamableTranscodeSession(streamable.id, deviceProfile)
                    .then((response) => {
                        return {
                            url: response.transcode_url,
                            name: streamable.name,
                            durationSeconds: streamable.duration_seconds
                        }
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
