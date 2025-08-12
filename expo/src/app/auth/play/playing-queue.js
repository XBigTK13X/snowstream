import C from '../../../common'

import PlayMediaPage from './media'

export default function PlayPlayingQueuePage() {
    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const loadVideo = (apiClient, localParams) => {
        return apiClient.getPlayingQueue({ source: localParams.playingQueueSource }).then(response => {
            setPlayingQueue(response)
            // This needs to make sure the video file selected is main_feature
            let entry = response.content[response.progress]
            if (entry.kind === 'm') {
                return apiClient.getMovie(entry.id).then((response) => {
                    const videoFile = response.video_files[localParams.videoFileIndex ?? 0]
                    const name = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${response.name}`
                    return {
                        url: videoFile.network_path,
                        name: name,
                        durationSeconds: videoFile.info.duration_seconds,
                        tracks: videoFile.info.tracks
                    }
                })
            }
            else if (entry.kind === 'e') {
                return apiClient.getEpisode(entry.id).then((response) => {
                    let name = `${response.season.show.name} - ${C.util.formatEpisodeTitle(response)}`
                    name = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${name}`
                    const videoFile = response.video_files[localParams.videoFileIndex ?? 0]
                    return {
                        url: videoFile.network_path,
                        name: name,
                        durationSeconds: videoFile.info.duration_seconds,
                        tracks: videoFile.info.tracks
                    }
                })
            }
            else {
                C.util.log("Unhandled playing queue entry")
                C.util.log({ entry })
            }
        })
    }

    const onComplete = (apiClient, routes) => {
        return apiClient.updatePlayingQueue(
            source = playingQueue.source,
            progress = playingQueue.progress + 1
        )
            .then(() => {
                routes.replace(routes.playPlayingQueue, { playingQueueSource })
            })
    }
    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            onComplete={onComplete}
        />
    )
}
