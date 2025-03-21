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
    const [videoFileId, setVideoFileId] = C.React.useState(null)
    const [forceTranscode, setForceTranscode] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!shelf && movieId) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
                const webPath = response.video_files[videoFileIndex].web_path
                setVideoFileId(response.video_files[videoFileIndex].id)
                setForceTranscode(true)
                setVideoUrl({ path: webPath })
            })
        }
        if (!shelf && episodeId) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
                const webPath = response.video_files[videoFileIndex].web_path
                setVideoFileId(response.video_files[videoFileIndex].id)
                setVideoUrl({ path: webPath })
                setForceTranscode(true)
            })
        }
        if (!videoUrl && streamableId) {
            apiClient.getStreamable(streamableId).then((response) => {
                setVideoUrl({ path: response.url })
                setForceTranscode(false)
            })
        }
    })

    let VideoPlayer = null
    if (C.Platform.OS !== 'web') {
        VideoPlayer = require('../../../comp/player-mpv').default
    }
    else {
        VideoPlayer = require('../../../comp/player-web').default
    }


    if (videoUrl && videoUrl.path) {
        let devVideoUrl = null
        const mkvUrl = "http://192.168.101.10:8000/mnt/m-media/movie/a/Ocean's Eleven (2001)/Ocean's Eleven (2001) WEBDL-480p.mkv"
        const frigateUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=68'
        const hdHomeRunUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=1'
        const hdHomeRunUrlTrans = 'http://192.168.101.10:8000/api/streamable/transcode?streamable_id=1'
        const iptvUrl = 'http://192.168.101.10:8000/api/streamable/direct?streamable_id=124'
        //devVideoUrl = frigateUrl
        //console.log({ devVideoUrl })
        //console.log({ videoUrl })
        return (
            <VideoPlayer
                videoUrl={devVideoUrl ? devVideoUrl : videoUrl.path}
                videoFileId={videoFileId}
                forceTranscode={forceTranscode}
            />
        )
    }
    return <C.SnowText>Loading video info...</C.SnowText>
}
