import C from '../../../common'

export default function PlayMediaPage() {
    const { apiClient } = C.useSession()
    const localParams = C.useLocalSearchParams()

    const shelfId = localParams.shelfId
    const movieId = localParams.movieId
    const episodeId = localParams.episodeId
    const streamableId = localParams.streamableId
    const videoFileIndex = localParams.videoFileIndex

    const [shelf, setShelf] = C.React.useState(null)
    const [movie, setMovie] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [transcode, setTranscode] = C.React.useState(false)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!shelf && movieId) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
                const videoFile = response.video_files[videoFileIndex]
                if (transcode) {
                    apiClient.createVideoFileTranscodeSession(videoFile.id).then((transcodeSession) => {
                        setVideoUrl(transcodeSession.transcode_url)
                    })
                } else {
                    setVideoUrl(videoFile.network_path)
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
                    apiClient.createVideoFileTranscodeSession(videoFile.id).then((transcodeSession) => {
                        setVideoUrl(transcodeSession.transcode_url)
                    })
                } else {
                    setVideoUrl(videoFile.network_path)
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
                    setVideoUrl(response.url)
                }
            })
        }
    })

    const onError = (err) => {
        if (!transcode) {
            setTranscode(true)
            setShelf(null)
        }
        else {
            setPlaybackFailed(true)
        }
    }

    if (playbackFailed) {
        return (
            <C.SnowText>Unable to play the video.</C.SnowText>
        )
    }

    if (videoUrl) {
        let devVideoUrl = null
        const mkvUrl = "http://192.168.101.10:8000/mnt/m-media/movie/a/Ocean's Eleven (2001)/Ocean's Eleven (2001) WEBDL-480p.mkv"
        const frigateUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=68'
        const hdHomeRunUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=1'
        const hdHomeRunUrlTrans = 'http://192.168.101.10:8000/api/streamable/transcode?streamable_id=1'
        const iptvUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=124'
        //devVideoUrl = frigateUrl
        //console.log({ devVideoUrl })
        //console.log({ videoUrl })
        console.log({ videoUrl })
        return (
            <C.SnowVideoPlayer
                videoUrl={devVideoUrl ? devVideoUrl : videoUrl}
                onError={onError}
            />
        )
    }
    return <C.SnowText>Loading video info...</C.SnowText>
}
