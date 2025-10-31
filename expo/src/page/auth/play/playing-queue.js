import { C, Player, useAppContext } from 'snowstream'
import PlayMediaPage from './media'

export default function PlayPlayingQueuePage() {
    const { navToItem } = useAppContext()
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
                    Player.action.onSelectTrack({
                        kind: 'audio',
                        audio_index: videoFile?.info?.tracks?.audio.at(0)?.audio_index ?? -1
                    })
                    Player.action.onSelectTrack({
                        kind: 'subtitle',
                        subtitle_index: videoFile?.info?.tracks?.subtitle.at(0)?.subtitle_index ?? -1
                    })
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
                    Player.action.onSelectTrack({
                        kind: 'audio',
                        audio_index: videoFile?.info?.tracks?.audio.at(0)?.audio_index ?? -1
                    })
                    Player.action.onSelectTrack({
                        kind: 'subtitle',
                        subtitle_index: videoFile?.info?.tracks?.subtitle.at(0)?.subtitle_index ?? -1
                    })
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
        const queue = playingQueueRef?.current
        return apiClient.updatePlayingQueue(
            queue.queue.source,
            queue.queue.progress + 1
        )
            .then(() => {
                Player.action.reset().then(() => {
                    navPush({
                        path: routes.playingQueuePlay,
                        params: {
                            playingQueueSource: queue.queue.source,
                            queueIndex: queue.queue.progress
                        },
                        func: false,
                        replace: false
                    })
                })
            })
    }

    const onStopVideo = (apiClient, routes, navPush) => {
        const queue = playingQueueRef?.current
        if (queue?.item) {
            navToItem(queue.item)
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
