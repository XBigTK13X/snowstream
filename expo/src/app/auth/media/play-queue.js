import C from '../../common'

import PlayMediaPage from './play-media'

export default function PlayPlayingQueuePage() {
    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const loadVideo = (apiClient, localParams) => {
        return apiClient.getPlayingQueue({ source: localParams.playingQueueSource }).then(response => {
            setPlayingQueue(response)
            // This needs to make sure the video file selected is main_feature
            let entry = response.content[response.progress]
            if (entry.kind === 'm') {
                return apiClient.getMovie(entry.id).then((response) => {
                    return {
                        videoFile: response.video_files[localParams.videoFileIndex ?? 0],
                        name: `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${response.name}`
                    }
                })
            }
            else if (entry.kind === 'e') {
                return apiClient.getEpisode(entry.id).then((response) => {
                    let name = `${response.season.show.name} - ${C.util.formatEpisodeTitle(response)}`
                    name = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${name}`
                    return {
                        videoFile: response.video_files[localParams.videoFileIndex ?? 0],
                        name: name
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
                routes.replace(routes.playMedia, { playingQueueSource })
            })
    }
    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            onComplete={onComplete}
        />
    )
}
