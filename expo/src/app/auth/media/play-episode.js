import C from '../../../common'

import PlayMediaPage from './play-media'

export default function PlayEpisodePage() {
    const loadVideo = (apiClient, localParams) => {

    }
    const updateProgress = (apiClient, localParams, progressSeconds, duration) => {
        return apiClient.setEpisodeWatchProgress(episodeId, progressSeconds, duration, countedWatch)
            .then((isWatched) => {
                if (isWatched && !countedWatch) {
                    setCountedWatch(true)

                }
            })
    }
    const increateWatchCount = (apiClient, localParams) => {
        return apiClient.increaseShowEpisodeWatchCount(episodeId)
    }
    return (
        <PlayMediaPage
        />
    )
}
