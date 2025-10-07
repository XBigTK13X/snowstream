import { C } from 'snowstream'

import PlayMediaPage from './media'

export default function PlayPlayingQueuePage() {
    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const loadVideo = (apiClient, localParams, deviceProfile) => {
        return apiClient.getPlayingQueue({ source: localParams.playingQueueSource }).then(queueResponse => {
            setPlayingQueue(queueResponse)
            // This needs to make sure the video file selected is main_feature
            let entry = queueResponse.content[queueResponse.progress]
            if (entry.kind === 'm') {
                return apiClient.getMovie(entry.id, deviceProfile).then((movieResponse) => {
                    const videoFile = movieResponse.video_files[localParams.videoFileIndex ?? 0]
                    const name = `Queue [${queueResponse.progress + 1}/${queueResponse.length}] - ${movieResponse.name}`
                    return {
                        url: videoFile.network_path,
                        name: name,
                        durationSeconds: videoFile.info.duration_seconds,
                        tracks: videoFile.info.tracks
                    }
                })
            }
            else if (entry.kind === 'e') {
                return apiClient.getEpisode(entry.id, deviceProfile).then((episodeResponse) => {
                    let name = `${episodeResponse.season.show.name} - ${C.util.formatEpisodeTitle(episodeResponse)}`
                    name = `Queue [${queueResponse.progress + 1}/${queueResponse.length}] - ${name}`
                    const videoFile = episodeResponse.video_files[localParams.videoFileIndex ?? 0]
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
        return apiClient.updatePlayingQueue(playingQueue.source, playingQueue.progress + 1)
            .then(() => {
                routes.replace(routes.playingQueuePlay, { playingQueueSource: playingQueue.source })
            })
    }
    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            onComplete={onComplete}
        />
    )
}
