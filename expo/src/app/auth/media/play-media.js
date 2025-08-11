import C from '../../../common'

export function PlayMediaPage() {
    const { apiClient, routes, config, clientOptions } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const videoFileIndex = localParams.videoFileIndex
    const forcePlayer = localParams.forcePlayer

    const initialSeekSeconds = localParams.seekToSeconds ? Math.floor(localParams.seekToSeconds) : 0

    const [playingQueueSource, setPlayingQueueSource] = C.React.useState(localParams.playingQueueSource)
    const [playingQueue, setPlayingQueue] = C.React.useState(null)

    const [videoUrl, setVideoUrl] = C.React.useState(null)

    const [audioTrackIndex, setAudioTrackIndex] = C.React.useState(0)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = C.React.useState(0)

    const [tracks, setTracks] = C.React.useState(null)
    const [videoLoaded, setVideoLoaded] = C.React.useState(false)
    const [videoTitle, setVideoTitle] = C.React.useState("")
    const [videoIsHdr, setVideoIsHdr] = C.React.useState(false)
    const [countedWatch, setCountedWatch] = C.React.useState(false)

    const [durationSeconds, setDurationSeconds] = C.React.useState(0.0)
    const durationRef = C.React.useRef(durationSeconds)
    const [throttledProgressSeconds, setProgressSeconds] = C.React.useState(0)
    const [initialSeekComplete, setInitialSeekComplete] = C.React.useState(false)
    const initialSeekRef = C.React.useRef(initialSeekComplete)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(null)

    let forceExo = false
    if (forcePlayer === 'exo') {
        forceExo = true
    }
    else if (videoIsHdr && forcePlayer !== 'mpv') {
        forceExo = true
    }
    else if (clientOptions.alwaysUseExoPlayer) {
        forceExo = true
    }

    C.React.useEffect(() => {
        if (!videoLoaded) {
            if (localParams.audioTrack) {
                setAudioTrackIndex(parseInt(localParams.audioTrack), 10)
            }
            if (localParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(localParams.subtitleTrack), 10)
            }
            props.loadVideo(localParams)
                .then((response) => {
                    if (response.videoFile) {
                        setTracks(response.videoFile.info.tracks)
                        setVideoUrl(response.videoFile.network_path)
                        setDurationSeconds(response.videoFile.info.duration_seconds)
                        durationRef.current = response.videoFile.info.duration_seconds
                        setVideoLoaded(true)
                    }
                })
        }
    })

    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            if (audioTrackIndex === track.audio_index) {
                setAudioTrackIndex(-1)
            } else {
                setAudioTrackIndex(track.audio_index)
            }

        }
        if (track.kind === 'subtitle') {
            if (subtitleTrackIndex === track.subtitle_index) {
                setSubtitleTrackIndex(-1)
            } else {
                setSubtitleTrackIndex(track.subtitle_index)
            }
        }
    }

    const onReadyToSeek = () => {
        if (!initialSeekRef.current) {
            initialSeekRef.current = true
            setInitialSeekComplete(true)
        }
    }

    const onSeek = (seekedToSeconds) => {
        return onProgress(seekedToSeconds, true)
    }

    const onProgress = (progressSeconds, force) => {
        if (force || Math.abs(progressSeconds - throttledProgressSeconds) >= config.progressMinDeltaSeconds) {
            setProgressSeconds(progressSeconds)
            if (!playingQueueSource) {
                const duration = durationRef.current
                if (duration > 0 && progressSeconds > 0) {
                    return props.updateProgress(apiClient, localParams, progressSeconds, duration)
                        .then((isWatched) => {
                            if (isWatched && !countedWatch) {
                                setCountedWatch(true)
                                return props.increaseWatchCount(apiClient)
                            }
                        })
                }
            }
        }
        return new Promise((resolve) => { resolve() })
    }

    const onError = (err) => {
        if (!transcode && !streamableId) {
            setTranscode(true)
            setShelf(null)
        }
        else {
            setPlaybackFailed(err)
        }
    }

    const onComplete = () => {
        const duration = durationRef.current
        onProgress(duration).then(() => {
            if (playingQueue) {
                return apiClient.updatePlayingQueue(
                    source = playingQueue.source,
                    progress = playingQueue.progress + 1
                )
                    .then(() => {
                        routes.replace(routes.playMedia, { playingQueueSource })
                    })
            } else {
                routes.back()
            }
        })
    }

    if (playbackFailed) {
        return (
            <C.View>
                <C.SnowText>Unable to play the video.</C.SnowText>
                <C.SnowText>Error: {JSON.stringify(playbackFailed)}</C.SnowText>
            </C.View>
        )
    }

    if (videoUrl) {
        return (
            <C.SnowVideoPlayer
                videoTitle={videoTitle}
                videoUrl={videoUrl}
                isTranscode={transcodeReady}
                onError={onError}
                tracks={tracks}
                subtitleIndex={subtitleTrackIndex}
                audioIndex={audioTrackIndex}
                selectTrack={selectTrack}
                onSeek={onSeek}
                onProgress={onProgress}
                onComplete={onComplete}
                durationSeconds={durationSeconds}
                forceExoPlayer={forceExo}
                initialSeekSeconds={initialSeekSeconds}
                initialSeekComplete={initialSeekRef}
                onReadyToSeek={onReadyToSeek}
            />
        )
    }
    return <C.SnowText>Loading video info...</C.SnowText>
}

export default PlayMediaPage