import C from '../../../common'

export default function PlayMediaPage() {
    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()

    const shelfId = localParams.shelfId
    const streamableId = localParams.streamableId

    const [episodeId, setEpisodeId] = C.React.useState(localParams.episodeId)
    const [movieId, setMovieId] = C.React.useState(localParams.movieId)
    const [playingQueueSource, setPlayingQueueSource] = C.React.useState(localParams.playingQueueSource)

    const [shelf, setShelf] = C.React.useState(null)
    const [movie, setMovie] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [playingQueue, setPlayingQueue] = C.React.useState(null)
    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [transcode, setTranscode] = C.React.useState(false)
    const [transcodeReady, setTranscodeReady] = C.React.useState(false)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(null)
    const [audioTrackIndex, setAudioTrackIndex] = C.React.useState(0)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = C.React.useState(0)
    const [durationSeconds, setDurationSeconds] = C.React.useState(0.0)
    const [tracks, setTracks] = C.React.useState(null)
    const [videoTitle, setVideoTitle] = C.React.useState("")
    const videoFileIndex = 0

    const durationRef = C.React.useRef(durationSeconds)

    const loadVideoFile = (videoHolder) => {
        const videoFile = videoHolder.video_files[videoFileIndex]
        if (transcode) {
            apiClient.createVideoFileTranscodeSession(videoFile.id, audioTrackIndex, subtitleTrackIndex).then((transcodeSession) => {
                setVideoUrl(transcodeSession.transcode_url)
                setTranscodeReady(true)
            })
        } else {
            setTracks(videoHolder.tracks.inspection.scored_tracks)
            setVideoUrl(videoFile.network_path)
            setDurationSeconds(videoHolder.tracks.duration_seconds)
            durationRef.current = videoHolder.tracks.duration_seconds
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
            let title = `${response.show.name} - ${response.episode_slug} - ${response.name}`
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
                    console.log("Unhandled playing queue entry")
                    console.log({ entry })
                }
            })
        }
    })

    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            setAudioTrackIndex(track.relative_index)
        }
        if (track.kind === 'subtitle') {
            setSubtitleTrackIndex(track.relative_index)
        }
    }

    const onSeek = (seekedToSeconds) => {
        return onProgress(seekedToSeconds)
    }

    const onProgress = (progressSeconds) => {
        if (!playingQueueSource) {
            const duration = durationRef.current
            if (duration > 0 && progressSeconds > 0) {
                if (movie) {
                    return apiClient.setMovieWatchProgress(movieId, progressSeconds, duration)
                }
                if (episode) {
                    return apiClient.setEpisodeWatchProgress(episodeId, progressSeconds, duration)
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
                let currentItem = playingQueue.content[playingQueue.progress]
                return apiClient.updatePlayingQueue(
                    source = playingQueue.source,
                    progress = playingQueue.progress + 1
                )
                    .then(() => {
                        if (currentItem.kind == 'e') {
                            return apiClient.increaseShowEpisodeWatchCount(currentItem.id)
                        }
                        else if (currentItem.kind == 'm') {
                            return apiClient.increaseMovieWatchCount(currentItem.id)
                        }
                    })
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
            />
        )
    }
    return <C.SnowText>Loading video info...</C.SnowText>
}
