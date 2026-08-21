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
    const queueIndexRef = C.React.useRef(queueIndex)
    const isTransitioningRef = C.React.useRef(false)

    queueIndexRef.current = queueIndex

    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return apiClient.getPlayingQueue({
            source: routeParams.playingQueueSource
        }).then(queueResponse => {
            setPlayingQueue(queueResponse)
            playingQueueRef.current = queueResponse
            const targetIndex = queueIndexRef.current ?? queueResponse.queue.progress
            let entry = queueResponse.queue.content[targetIndex]
            if (entry.kind === 'm') {
                return apiClient.getMovie(entry.id, deviceProfile).then((movieResponse) => {
                    const videoFile = movieResponse.video_files[routeParams.videoFileIndex ?? 0]
                    const name = `Queue [${targetIndex + 1}/${queueResponse.queue.length}] - ${movieResponse.name}`
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
                    name = `Queue [${targetIndex + 1}/${queueResponse.queue.length}] - ${name}`
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
        if (isTransitioningRef.current) {
            return Promise.resolve()
        }
        isTransitioningRef.current = true

        Player.action.reset()
        setIsTransitioning(true)

        const queue = playingQueueRef?.current
        const currentIndex = queueIndexRef.current ?? queue?.queue?.progress ?? 0
        const totalItems = queue?.queue?.content?.length ?? 1
        let nextProgress = currentIndex + 1
        if (nextProgress >= totalItems) {
            nextProgress = 0
        }

        const source = queue?.queue?.source ?? currentRoute?.routeParams?.playingQueueSource

        return apiClient.updatePlayingQueue(
            source,
            nextProgress
        ).then(() => {
            queueIndexRef.current = nextProgress
            setQueueIndex(nextProgress)
            setTimeout(() => {
                isTransitioningRef.current = false
                setIsTransitioning(false)
            }, 100)
        }).catch((error) => {
            isTransitioningRef.current = false
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