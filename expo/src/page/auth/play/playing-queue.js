import { C, useAppContext } from 'snowstream'
import { util } from 'expo-snowui'
import PlayMediaPage from './media'
import Player from 'snowstream-player'

export default function PlayPlayingQueuePage(props) {
    const { routes } = useAppContext()
    const { currentRoute, navReset, navPop } = C.useSnowContext(props)
    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const [isTransitioning, setIsTransitioning] = C.React.useState(false)
    const [queueIndex, setQueueIndex] = C.React.useState(
        currentRoute?.routeParams?.queueIndex ?? null
    )
    const playingQueueRef = C.React.useRef(playingQueue)

    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getPlayingQueue({
            source: routeParams.playingQueueSource
        }).then(queueResponse => {
            setPlayingQueue(queueResponse)
            playingQueueRef.current = queueResponse
            let entry = queueResponse.queue.content[queueResponse.queue.progress]
            if (entry.kind === 'm') {
                return apiClient.getMovie(entry.id, deviceProfile).then((movieResponse) => {
                    const videoFile = movieResponse.video_files[routeParams.videoFileIndex ?? 0]
                    const name = `Queue [${queueResponse.queue.progress + 1}/${queueResponse.queue.length}] - ${movieResponse.name}`
                    return {
                        url: videoFile.network_path,
                        name: name,
                        durationSeconds: videoFile.info.duration_seconds,
                        tracks: videoFile.info.tracks,
                        audio_index: videoFile?.info?.tracks?.audio.at(0)?.audio_index ?? -1,
                        subtitle_index: videoFile?.info?.tracks?.subtitle.at(0)?.subtitle_index ?? -1,
                        plan: videoFile.plan,
                        info: videoFile.info
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
                        tracks: videoFile.info.tracks,
                        audio_index: videoFile?.info?.tracks?.audio.at(0)?.audio_index ?? -1,
                        subtitle_index: videoFile?.info?.tracks?.subtitle.at(0)?.subtitle_index ?? -1,
                        plan: videoFile.plan,
                        info: videoFile.info
                    }
                })
            }
            else {
                C.util.log("Unhandled playing queue entry")
                C.util.log({ entry })
            }
        })
    }

    const onComplete = (apiClient, routesContext, navPushContext) => {
        const queue = playingQueueRef?.current
        let nextProgress = queue.queue.progress + 1
        if (nextProgress > queue.queue.content.length - 1) {
            nextProgress = 0
        }
        setIsTransitioning(true)
        return apiClient.updatePlayingQueue(
            queue.queue.source,
            nextProgress
        ).then(() => {
            setQueueIndex(nextProgress)
            setIsTransitioning(false)
        })
    }

    const onStopVideo = (apiClient, routes, navPush, navPop, toHome) => {
        if (toHome) {
            navPop()
            navReset()
            Player.action.reset()
            return
        }
        navPop()
        Player.action.reset()
    }
    if (isTransitioning) {
        return (
            <C.FillView>
                <C.SnowHeader style={{ flex: 1 }} center>Getting next queue item.</C.SnowHeader>
                <C.SnowLabel style={{ flex: 1 }} center>This should only take a moment.</C.SnowLabel>
            </C.FillView>
        )
    }

    const activeIndex = queueIndex ?? playingQueue?.queue?.progress ?? 0

    return (
        <PlayMediaPage
            key={activeIndex}
            loadVideo={loadVideo}
            onComplete={onComplete}
            onStopVideo={onStopVideo}
        />
    )
}