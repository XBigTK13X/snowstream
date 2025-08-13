import C from '../../../common'

export function PlayMediaPage(props) {
    const { apiClient, routes, config, clientOptions } = C.useAppContext()
    const localParams = C.useLocalSearchParams()
    const pathname = C.usePathname()

    const initialSeekSeconds = localParams.seekToSeconds ? Math.floor(localParams.seekToSeconds) : 0

    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [videoTitle, setVideoTitle] = C.React.useState(null)

    const [audioTrackIndex, setAudioTrackIndex] = C.React.useState(0)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = C.React.useState(0)

    const [tracks, setTracks] = C.React.useState(null)
    const [videoLoaded, setVideoLoaded] = C.React.useState(false)
    const [countedWatch, setCountedWatch] = C.React.useState(false)

    const [durationSeconds, setDurationSeconds] = C.React.useState(0.0)
    const durationRef = C.React.useRef(durationSeconds)
    const [throttledProgressSeconds, setProgressSeconds] = C.React.useState(0)
    const [initialSeekComplete, setInitialSeekComplete] = C.React.useState(false)
    const initialSeekRef = C.React.useRef(initialSeekComplete)
    const [manualSeekSeconds, setManualSeekSeconds] = C.React.useState(0)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(null)

    const forcePlayer = localParams.forcePlayer
    let forceExo = false
    if (forcePlayer === 'exo') {
        forceExo = true
    }
    else if (localParams.videoIsHdr && forcePlayer !== 'mpv') {
        forceExo = true
    }
    else if (clientOptions.alwaysUseExoPlayer) {
        forceExo = true
    }

    let shouldTranscode = false
    if (localParams.transcode) {
        shouldTranscode = localParams.transcode
    }
    if (clientOptions.alwaysTranscode) {
        shouldTranscode = true
    }

    const loadVideo = (response) => {
        if (response.url) {
            setVideoUrl(response.url)
        }
        if (response.name) {
            setVideoTitle(response.name)
        }
        if (response.durationSeconds) {
            setDurationSeconds(response.durationSeconds)
            durationRef.current = response.durationSeconds
        }
        if (response.tracks) {
            setTracks(response.tracks)
        }
        setVideoLoaded(true)
    }

    C.React.useEffect(() => {
        if (!videoLoaded) {
            if (localParams.audioTrack) {
                setAudioTrackIndex(parseInt(localParams.audioTrack), 10)
            }
            if (localParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(localParams.subtitleTrack), 10)
            }
            if (shouldTranscode) {
                if (props.loadTranscode) {
                    props.loadTranscode(apiClient, localParams, clientOptions.deviceProfile, initialSeekSeconds)
                        .then(loadVideo)
                }
            }
            else {
                if (props.loadVideo) {
                    props.loadVideo(apiClient, localParams)
                        .then(loadVideo)
                }
            }
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

    const onProgress = (progressSeconds, manualSeek) => {
        if (manualSeek || Math.abs(progressSeconds - throttledProgressSeconds) >= config.progressMinDeltaSeconds) {
            setProgressSeconds(progressSeconds)
            const duration = durationRef.current
            if (duration > 0 && progressSeconds > 0) {
                if (props.updateProgress) {
                    return props.updateProgress(apiClient, localParams, progressSeconds, duration)
                        .then((isWatched) => {
                            if (isWatched && !countedWatch) {
                                setCountedWatch(true)
                                if (props.increaseWatchCount) {
                                    return props.increaseWatchCount(apiClient)
                                }
                            }
                        })
                }
            }
            // Transcode streams have no seek capability
            // Destroy and create a new one instead at the requested timestamp
            if (shouldTranscode && manualSeek) {
                if (props.loadTranscode) {
                    setManualSeekSeconds(progressSeconds)
                    props.loadTranscode(apiClient, localParams, clientOptions.deviceProfile, progressSeconds)
                        .then(loadVideo)
                }
            }
        }
        return new Promise((resolve) => { resolve() })
    }

    const onError = (err) => {
        if (!props.transcode) {
            setVideoLoaded(false)
            routes.replace(pathname, { ...localParams, ...{ transcode: true } })
        }
        else {
            setPlaybackFailed(err)
        }
    }

    const onComplete = () => {
        const duration = durationRef.current
        onProgress(duration).then(() => {
            if (props.onComplete) {
                props.onComplete(apiClient, routes)
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

    if (!videoUrl) {
        if (shouldTranscode) {
            return <C.SnowText>Preparing a transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        }
        return <C.SnowText>Loading video. This should only take a moment.</C.SnowText>
    }
    console.log({ shouldTranscode, durationSeconds, initialSeekSeconds, throttledProgressSeconds })
    return (
        <C.SnowVideoPlayer
            videoTitle={videoTitle}
            videoUrl={videoUrl}
            isTranscode={shouldTranscode}
            onError={onError}
            tracks={tracks}
            subtitleIndex={subtitleTrackIndex}
            audioIndex={audioTrackIndex}
            selectTrack={selectTrack}
            onSeek={onSeek}
            onProgress={onProgress}
            onComplete={onComplete}
            manualSeekSeconds={manualSeekSeconds}
            durationSeconds={durationSeconds}
            forceExoPlayer={forceExo}
            initialSeekSeconds={initialSeekSeconds}
            initialSeekComplete={initialSeekRef}
            onReadyToSeek={onReadyToSeek}
        />
    )

}

export default PlayMediaPage