import PlayMediaPage from './media'

export default function PlayStreamablePage() {
    const loadVideo = (apiClient, localParams) => {
        return apiClient.getStreamable(localParams.streamableId).then((response) => {
            return {
                url: response.url,
                name: response.name,
                durationSeconds: response.duration_seconds
            }
        })
    }

    const loadTranscode = (apiClient, localParams) => {
        return apiClient.getStreamable(localParams.streamableId)
            .then((streamable) => {
                return apiClient.createStreamableTranscodeSession(streamable.id)
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
