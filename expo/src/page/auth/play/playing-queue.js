import { C, useAppContext } from 'snowstream'
import PlayMediaPage from './media'

export default function PlayPlayingQueuePage(props) {
    const { currentRoute, navReset, navPop, emitHubEvent } = C.useSnowContext(props)

    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const [isTransitioning, setIsTransitioning] = C.React.useState(false)
    const [queueIndex, setQueueIndex] = C.React.useState(
        currentRoute?.routeParams?.queueIndex ?? null
    )
    const [playGeneration, setPlayGeneration] = C.React.useState(0)

    const playingQueueRef = C.React.useRef(playingQueue)
    const queueIndexRef = C.React.useRef(queueIndex)
    const isTransitioningRef = C.React.useRef(false)

    const getTargetEntry = (queueResponse) => {
        const targetIndex = queueIndexRef.current ?? queueResponse.queue.progress ?? 0
        const entry = queueResponse.queue.content[targetIndex]
        return { targetIndex, entry }
    }

    const loadQueueItem = (apiClient, routeParams, deviceProfile, singleLineTitle) => {
        return apiClient.getPlayingQueue({
            source: routeParams.playingQueueSource
        }).then((queueResponse) => {
            setPlayingQueue(queueResponse)
            playingQueueRef.current = queueResponse

            const { targetIndex, entry } = getTargetEntry(queueResponse)
            if (!entry) {
                return Promise.reject(new Error('Playing queue entry not found'))
            }
            queueIndexRef.current = targetIndex

            const videoFileIndex = routeParams.videoFileIndex ?? 0
            if (entry.kind !== 'm' && entry.kind !== 'e') {
                return Promise.reject(new Error('Unhandled playing queue entry type'))
            }

            const fetchEntity = entry.kind === 'm'
                ? apiClient.getMovie(entry.id, deviceProfile)
                : apiClient.getEpisode(entry.id, deviceProfile)

            return fetchEntity.then((entityResponse) => {
                const videoFile = entityResponse.video_files[videoFileIndex] || entityResponse.video_files[0]
                const titleSeparator = singleLineTitle ? ' - ' : '\n'
                const itemTitle = entry.kind === 'm'
                    ? entityResponse.name
                    : `${entityResponse.season.show.name}${titleSeparator}${C.util.formatEpisodeTitle(entityResponse)}`
                const name = `Queue [${targetIndex + 1}/${queueResponse.queue.content.length}] - ${itemTitle}`
                return { videoFile, name }
            })
        })
    }

    const loadVideo = (apiClient, routeParams, deviceProfile) => {
        return loadQueueItem(apiClient, routeParams, deviceProfile, false).then(({ videoFile, name }) => {
            const audioTracks = videoFile?.info?.tracks?.audio || []
            const subtitleTracks = videoFile?.info?.tracks?.subtitle || []

            return {
                url: videoFile.network_path,
                name: name,
                durationSeconds: videoFile.info.duration_seconds,
                tracks: videoFile.info.tracks,
                audio_index: audioTracks.length > 0 ? audioTracks[0].audio_index : -1,
                subtitle_index: subtitleTracks.length > 0 ? subtitleTracks[0].subtitle_index : -1,
                plan: videoFile.plan,
                info: videoFile.info
            }
        })
    }

    const loadTranscode = (apiClient, routeParams, deviceProfile, progressSeconds, playerKind) => {
        return loadQueueItem(apiClient, routeParams, deviceProfile, true).then(({ videoFile, name }) => {
            const seekSeconds = progressSeconds ?? routeParams.seekToSeconds ?? 0

            return apiClient.createVideoFileTranscodeSession({
                videoFileId: videoFile.id,
                audioTrackIndex: routeParams.audioTrack,
                subtitleTrackIndex: routeParams.subtitleTrack,
                deviceProfile: deviceProfile,
                seekToSeconds: seekSeconds,
                playerKind: playerKind
            }).then((transcodeSession) => {
                return {
                    name: name,
                    url: transcodeSession.transcode_url,
                    durationSeconds: videoFile.info.duration_seconds,
                    transcodeId: transcodeSession.transcode_session_id,
                    plan: videoFile.plan,
                    info: videoFile.info
                }
            })
        }).catch((err) => {
            return { error: err }
        })
    }

    const onComplete = (apiClient) => {
        if (isTransitioningRef.current) {
            return Promise.resolve()
        }
        isTransitioningRef.current = true

        emitHubEvent('player.reset')
        setIsTransitioning(true)

        const queue = playingQueueRef.current
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
            setPlayGeneration((prev) => prev + 1)
            setTimeout(() => {
                isTransitioningRef.current = false
                setIsTransitioning(false)
            }, 100)
        }).catch(() => {
            isTransitioningRef.current = false
            setIsTransitioning(false)
        })
    }

    const onStopVideo = (apiClient, routesNav, navPushNav, navPopNav, toHome) => {
        emitHubEvent('player.reset')
        if (toHome) {
            navPop()
            navReset()
            return
        }
        navPop()
    }


    if (isTransitioning) {
        return (
            <C.FillView>
                <C.SnowHeader style={{ flex: 1 }} center>Getting next queue item.</C.SnowHeader>
                <C.SnowLabel style={{ flex: 1 }} center>This should only take a moment.</C.SnowLabel>
            </C.FillView>
        )
    }

    return (
        <PlayMediaPage
            key={playGeneration}
            loadVideo={loadVideo}
            loadTranscode={loadTranscode}
            onComplete={onComplete}
            onStopVideo={onStopVideo}
        />
    )
}