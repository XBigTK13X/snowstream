import { C } from 'snowstream'

import PlayMediaPage from './media'

export default function PlayPlayingQueuePage() {
    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const playingQueueRef = C.React.useRef(playingQueue)
    C.React.useEffect(() => {
        playingQueueRef.current = playingQueue
    }, [playingQueue])
    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getPlayingQueue({
            source: routeParams.playingQueueSource
        }).then(queueResponse => {
            setPlayingQueue(queueResponse)
            // This needs to make sure the video file selected is main_feature
            let entry = queueResponse.queue.content[queueResponse.queue.progress]
            if (entry.kind === 'm') {
                return apiClient.getMovie(entry.id, deviceProfile).then((movieResponse) => {
                    const videoFile = movieResponse.video_files[routeParams.videoFileIndex ?? 0]
                    const name = `Queue [${queueResponse.queue.progress + 1}/${queueResponse.queue.length}] - ${movieResponse.name}`
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
                    name = `Queue [${queueResponse.queue.progress + 1}/${queueResponse.queue.length}] - ${name}`
                    const videoFile = episodeResponse.video_files[routeParams.videoFileIndex ?? 0]
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

    const onComplete = (apiClient, routes, navPush) => {
        return apiClient.updatePlayingQueue(playingQueue.queue.source, playingQueue.queue.progress + 1)
            .then(() => {
                navPush({ playingQueueSource: playingQueue.queue.source })
            })
    }

    const onStopVideo = (apiClient, routes, navPush) => {
        if (playingQueueRef?.current) {
            if (playingQueueRef?.current.kind === 'playlist') {
                navPush(routes.playlistDetails, { tagId: playingQueueRef?.current?.kind_id })
            }
            if (playingQueueRef?.current.kind === 'show') {
                navPush(routes.seasonList, { showId: playingQueueRef?.current?.kind_id })
            }
            if (playingQueueRef?.current.kind === 'show_season') {
                navPush(routes.episodeList, { seasonId: playingQueueRef?.current?.kind_id })
            }
        }
    }

    return (
        <PlayMediaPage
            loadVideo={loadVideo}
            onComplete={onComplete}
            onStopVideo={onStopVideo}
        />
    )
}
