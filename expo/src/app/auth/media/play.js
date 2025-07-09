import C from '../../../common'

export default function PlayMediaPage() {
    const { apiClient, routes, config } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const shelfId = localParams.shelfId
    const streamableId = localParams.streamableId
    const videoFileIndex = localParams.videoFileIndex
    const forcePlayer = localParams.forcePlayer

    const initialSeekSeconds = localParams.seekToSeconds ? Math.floor(localParams.seekToSeconds) : 0

    const [episodeId, setEpisodeId] = C.React.useState(localParams.episodeId)
    const [movieId, setMovieId] = C.React.useState(localParams.movieId)
    const [playingQueueSource, setPlayingQueueSource] = C.React.useState(localParams.playingQueueSource)

    const [shelf, setShelf] = C.React.useState(null)
    const [movie, setMovie] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [playingQueue, setPlayingQueue] = C.React.useState(null)

    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [transcode, setTranscode] = C.React.useState(localParams.transcode ? localParams.transcode : false)
    const [transcodeReady, setTranscodeReady] = C.React.useState(false)

    const [audioTrackIndex, setAudioTrackIndex] = C.React.useState(0)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = C.React.useState(0)

    const [tracks, setTracks] = C.React.useState(null)
    const [videoTitle, setVideoTitle] = C.React.useState("")
    const [videoIsHdr, setVideoIsHdr] = C.React.useState(false)
    const [countedWatch, setCountedWatch] = C.React.useState(false)

    const [durationSeconds, setDurationSeconds] = C.React.useState(0.0)
    const durationRef = C.React.useRef(durationSeconds)
    const [throttledProgressSeconds, setProgressSeconds] = C.React.useState(0)
    const [initialSeekComplete, setInitialSeekComplete] = C.React.useState(false)
    const initialSeekRef = C.React.useRef(initialSeekComplete)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(null)


    const loadVideoFile = (videoHolder) => {
        // TODO This is where the playing queue needs to determine a videoFileIndex
        const videoFile = videoHolder.video_files[videoFileIndex ? videoFileIndex : 0]
        if (transcode) {
            apiClient.createVideoFileTranscodeSession(
                videoFile.id,
                audioTrackIndex,
                subtitleTrackIndex
            ).then((transcodeSession) => {
                setVideoUrl(transcodeSession.transcode_url)
                setTranscodeReady(true)
                setVideoIsHdr(videoFile.is_hdr)
            })
        } else {
            setTracks(videoFile.info.tracks)
            setVideoUrl(videoFile.network_path)
            setDurationSeconds(videoFile.info.duration_seconds)
            durationRef.current = videoFile.info.duration_seconds
        }
    }

    const loadMovie = (loadMovieId) => {
        apiClient.getMovie(loadMovieId).then((response) => {
            setMovie(response)
            setMovieId(loadMovieId)
            loadVideoFile(response)
            let title = response.name
            if (playingQueue) {
                title = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${title}`
            }
            setVideoTitle(title)
        })
    }

    const loadEpisode = (loadEpisodeId) => {
        apiClient.getEpisode(loadEpisodeId).then((response) => {
            setEpisode(response)
            setEpisodeId(loadEpisodeId)
            loadVideoFile(response)
            let title = `${response.season.show.name} - ${response.episode_slug} - ${response.name}`
            if (playingQueue) {
                title = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${title}`
            }
            setVideoTitle(title)
        })
    }


    C.React.useEffect(() => {
        if (!shelf) {
            if (localParams.audioTrack) {
                setAudioTrackIndex(parseInt(localParams.audioTrack), 10)
            }
            if (localParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(localParams.subtitleTrack), 10)
            }
        }
        if (shelfId && !shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            if (movieId) {
                loadMovie(movieId)
            }
            if (episodeId) {
                loadEpisode(episodeId)
            }
        }
        if (!videoUrl && streamableId) {
            apiClient.getStreamable(streamableId).then((response) => {
                if (transcode) {
                    apiClient.createStreamableTranscodeSession(streamableId).then((transcodeSession) => {
                        setVideoUrl(transcodeSession.transcode_url)
                        setTranscodeReady(true)
                    })
                } else {
                    setVideoUrl(response.url)
                }
                setVideoTitle(response.name)
            })
        }
        if (!playingQueue && playingQueueSource) {
            apiClient.getPlayingQueue({ source: playingQueueSource }).then(response => {
                setPlayingQueue(response)
                let entry = response.content[response.progress]
                if (entry.kind === 'm') {
                    loadMovie(entry.id)
                }
                else if (entry.kind === 'e') {
                    loadEpisode(entry.id)
                }
                else {
                    C.util.log("Unhandled playing queue entry")
                    C.util.log({ entry })
                }
            })
        }
    })

    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            setAudioTrackIndex(track.audio_index)
        }
        if (track.kind === 'subtitle') {
            setSubtitleTrackIndex(track.subtitle_index)
        }
    }

    const onReadyToSeek = () => {
        if (!initialSeekRef.current) {
            initialSeekRef.current = true
            setInitialSeekComplete(true)

            //setProgressSeconds(initialSeekSeconds)
        }
    }

    const onSeek = (seekedToSeconds) => {
        return onProgress(seekedToSeconds, true)
    }

    const onProgress = (progressSeconds, force) => {
        if (Math.abs(progressSeconds - throttledProgressSeconds) >= config.progressMinDeltaSeconds || force) {
            setProgressSeconds(progressSeconds)
            if (!playingQueueSource) {
                const duration = durationRef.current
                if (duration > 0 && progressSeconds > 0) {
                    if (movie) {
                        return apiClient.setMovieWatchProgress(movieId, progressSeconds, duration, countedWatch)
                            .then((isWatched) => {
                                if (isWatched && !countedWatch) {
                                    setCountedWatch(true)
                                    return apiClient.increaseMovieWatchCount(movieId)
                                }
                            })
                    }
                    if (episode) {
                        return apiClient.setEpisodeWatchProgress(episodeId, progressSeconds, duration, countedWatch)
                            .then((isWatched) => {
                                if (isWatched && !countedWatch) {
                                    setCountedWatch(true)
                                    return apiClient.increaseShowEpisodeWatchCount(episodeId)
                                }
                            })
                    }
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

    if (transcode && !transcodeReady) {
        return (
            <C.View>
                <C.SnowText>This video cannot be played directly on this device.</C.SnowText>
                <C.SnowText>Please wait a few moments while the server transcodes it to a supported format.</C.SnowText>
            </C.View>
        )
    }

    let forceExo = false
    if (forcePlayer === 'exo') {
        forceExo = true
    }
    else if (videoIsHdr && forcePlayer !== 'mpv') {
        forceExo = true
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
