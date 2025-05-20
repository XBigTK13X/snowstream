import C from '../../../common'

// TODO Remove this debugging stuff once all the video players are functional
let devVideoUrl = null
const mkvUrl = "http://192.168.101.10:8000/mnt/m-media/movie/a/Ocean's Eleven (2001)/Ocean's Eleven (2001) WEBDL-480p.mkv"
const frigateUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=68'
const hdHomeRunUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=1'
const hdHomeRunUrlTrans = 'http://192.168.101.10:8000/api/streamable/transcode?streamable_id=1'
const iptvUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=124'
//devVideoUrl = frigateUrl

export default function PlayMediaPage() {
    const { apiClient } = C.useSession()
    const { config } = C.useSettings()
    const localParams = C.useLocalSearchParams()

    const shelfId = localParams.shelfId
    const movieId = localParams.movieId
    const episodeId = localParams.episodeId
    const streamableId = localParams.streamableId

    const [shelf, setShelf] = C.React.useState(null)
    const [movie, setMovie] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [transcode, setTranscode] = C.React.useState(false)
    const [transcodeReady, setTranscodeReady] = C.React.useState(false)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(null)
    const [audioTrackIndex, setAudioTrackIndex] = C.React.useState(0)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = C.React.useState(0)
    const [durationSeconds, setDurationSeconds] = C.React.useState(0.0)
    const [tracks, setTracks] = C.React.useState(null)
    const videoFileIndex = 0

    const durationRef = C.React.useRef(durationSeconds)

    C.React.useEffect(() => {
        if (!shelf) {
            if (localParams.audioTrack) {
                setAudioTrackIndex(parseInt(localParams.audioTrack), 10)
            }
            if (localParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(localParams.subtitleTrack), 10)
            }
        }
        if (!shelf && movieId) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
                const videoFile = response.video_files[videoFileIndex]
                if (transcode) {
                    apiClient.createVideoFileTranscodeSession(videoFile.id, audioTrackIndex, subtitleTrackIndex).then((transcodeSession) => {
                        setVideoUrl(transcodeSession.transcode_url)
                        setTranscodeReady(true)
                    })
                } else {
                    setTracks(response.tracks.inspection.scored_tracks)
                    setVideoUrl(videoFile.network_path)
                    setDurationSeconds(response.tracks.duration_seconds)
                    durationRef.current = response.tracks.duration_seconds
                }
            })
        }
        if (!shelf && episodeId) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
                const videoFile = response.video_files[videoFileIndex]
                if (transcode) {
                    apiClient.createVideoFileTranscodeSession(videoFile.id, audioTrackIndex, subtitleTrackIndex).then((transcodeSession) => {
                        setVideoUrl(transcodeSession.transcode_url)
                        setTranscodeReady(true)
                    })
                } else {
                    setTracks(response.tracks.inspection.scored_tracks)
                    setVideoUrl(videoFile.network_path)
                    setDurationSeconds(response.tracks.duration_seconds)
                    durationRef.current = response.tracks.duration_seconds
                }
            })
        }
        if (!videoUrl && streamableId) {
            apiClient.getStreamable(streamableId).then((response) => {
                if (transcode) {
                    apiClient.createStreamableTranscodeSession(streamableId).then((transcodeSession) => {
                        setVideoUrl(transcodeSession.transcode_url)
                    })
                } else {
                    // TODO ffprobe the streamable before handing it back to the client
                    setVideoUrl(response.url)
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
        onProgress(seekedToSeconds)
    }

    const onProgress = (progressSeconds) => {
        const duration = durationRef.current
        if (duration > 0) {
            if (movie) {
                apiClient.setMovieWatchProgress(movieId, progressSeconds, duration)
            }
            if (episode) {
                apiClient.setEpisodeWatchProgress(episodeId, progressSeconds, duration)
            }
        }
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
                videoUrl={devVideoUrl ? devVideoUrl : videoUrl}
                isTranscode={transcodeReady}
                onError={onError}
                tracks={tracks}
                subtitleIndex={subtitleTrackIndex}
                audioIndex={audioTrackIndex}
                selectTrack={selectTrack}
                onSeek={onSeek}
                onProgress={onProgress}
                durationSeconds={durationSeconds}
            />
        )
    }
    return <C.SnowText>Loading video info...</C.SnowText>
}
