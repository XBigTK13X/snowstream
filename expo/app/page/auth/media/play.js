import C from '../../../common'

const windowWidth = C.Dimensions.get('window').width
const windowHeight = C.Dimensions.get('window').height

// TODO This is super janky. I think the entire view needs to be pulled out of the layout to work
// Pass in the needed parts for auth
var styles = C.StyleSheet.create({
    videoView: {
        position: 'absolute',
        top: -9,
        left: 0,
        bottom: 0,
        right: 0,
        width: windowWidth,
        height: windowHeight,
        elevation: 1000,
    },
})

// https://thewidlarzgroup.github.io/react-native-video#v600-information

export default function PlayMediaPage() {
    const videoRef = C.React.useRef(null)
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const navigation = C.useNavigation()

    const shelfId = localParams.shelfId
    const movieId = localParams.movieId
    const episodeId = localParams.episodeId
    const streamableId = localParams.streamableId
    const videoFileIndex = localParams.videoFileIndex

    const [shelf, setShelf] = C.React.useState(null)
    const [movie, setMovie] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [mpvDestroyed, setMpvDestroyed] = C.React.useState(false)
    let Libmpv = null
    let LibmpvVideo = null

    C.React.useEffect(() => {
        if (!shelf && movieId) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getMovie(movieId).then((response) => {
                setMovie(response)
                const webPath = response.video_files[videoFileIndex].web_path
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
                setVideoUrl({ path: webPath })
            })
        }
        if (!videoUrl && streamableId) {
            apiClient.getStreamable(streamableId).then((response) => {
                console.log({ response })
                setVideoUrl({ path: response.url })
            })
        }
    })

    if (C.Platform.OS != 'web') {
        libmpv = require('react-native-libmpv')
        Libmpv = libmpv.Libmpv
        LibmpvVideo = libmpv.LibmpvVideo
    }
    else {
        if (videoUrl && videoUrl.path) {
            return <C.SnowText>Video player not yet supported in web. The URL to reach the video file is {videoUrl.path}</C.SnowText>
        }
        else {
            return <C.SnowText>Video player not yet supported in web.</C.SnowText>
        }
    }

    C.React.useEffect(() => {
        const cleanup = navigation.addListener('beforeRemove', (e) => {
            if (Libmpv && Libmpv.cleanup) {
                Libmpv.cleanup()
            }
            return
        })
        return cleanup
    }, [navigation])

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
            <C.View style={styles.videoView}>
                <LibmpvVideo playUrl={devVideoUrl ? devVideoUrl : videoUrl.path} />
            </C.View>
        )
    }
    return <Text style={{ color: 'white' }}>Getting video info...</Text>
}
