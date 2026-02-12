import PlayMediaPage from './media'

export default function PlayStreamablePage() {
    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getStreamable(routeParams.streamableId, deviceProfile).then((response) => {
            return {
                url: response.url,
                name: response.name,
                durationSeconds: response.duration_seconds,
                mpvDecodingMode: response.stream_source.kind === 'FrigateNvr' ? 'no' : null,
                plan: response.plan,
                info: response.info
            }
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile, playerKind) => {
        return apiClient.getStreamable(routeParams.streamableId)
            .then((streamable) => {
                return apiClient.createStreamableTranscodeSession({
                    streamableId: streamable.id,
                    deviceProfile: deviceProfile,
                    playerKind: playerKind
                })
                    .then((response) => {
                        return {
                            url: response.transcode_url,
                            name: streamable.name,
                            durationSeconds: streamable.duration_seconds,
                            mpvDecodingMode: response.stream_source.kind === 'FrigateNvr' ? 'no' : null,
                            plan: response.plan,
                            info: response.info
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
