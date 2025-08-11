import PlayMediaPage from './play-media'

export default function PlayEpisodePage() {
    const loadVideo = (apiClient, localParams) => {
        apiClient.getEpisode(loadEpisodeId).then((response) => {
            return {
                videoFile: response.video_files[localParams.videoFileIndex ?? 0],
                name: `${response.season.show.name} - ${C.util.formatEpisodeTitle(response)}`
            }
        })
    }
    const updateProgress = (apiClient, localParams, progressSeconds, duration) => {
        return apiClient.setEpisodeWatchProgress(episodeId, progressSeconds, duration, countedWatch)
    }

    const increateWatchCount = (apiClient, localParams) => {
        return apiClient.increaseShowEpisodeWatchCount(episodeId)
    }
    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            updateProgress={updateProgress}
            increateWatchCount={increaseWatchCount}
        />
    )
}
