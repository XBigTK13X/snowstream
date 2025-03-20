import C from '../common'

const windowWidth = C.Dimensions.get('window').width
const windowHeight = C.Dimensions.get('window').height

// TODO This is super janky. I think the entire view needs to be pulled out of the layout to work
// Pass in the needed parts for auth
var styles = C.StyleSheet.create({
    videoView: {
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        position: 'absolute',
        width: windowWidth,
        height: windowHeight,
        elevation: 1,
        zIndex: 1
    },
    video: {
        position: 'absolute',
        border: "1px solid transparent",
        margin: "-1px",
        width: windowWidth,
        height: windowHeight,
        elevation: 1,
        zIndex: 1
    },
    videoModal: {
        width: windowWidth,
        height: windowHeight,
        elevation: 1,
        zIndex: 1
    },
    videoVideo: {
        width: windowWidth,
        height: windowHeight,
        elevation: 1,
        zIndex: 1
    }
})

export default function PlayerMpv(props) {
    const navigation = C.useNavigation()
    let libmpv = require('react-native-libmpv')
    let Libmpv = libmpv.Libmpv
    let LibmpvVideo = libmpv.LibmpvVideo
    const [videoVisible, setVideoVisible] = C.React.useState(true)

    C.React.useEffect(() => {
        const cleanup = navigation.addListener('beforeRemove', (e) => {
            if (Libmpv && Libmpv.cleanup) {
                Libmpv.cleanup()
            }
            return
        })
        return cleanup
    }, [navigation])

    return (
        <C.Modal visible={videoVisible} styles={styles.videoModal} onRequestClose={() => { console.log("Pausing..."); Libmpv.pause(); Libmpv.cleanup(); setVideoVisible(false); }}>
            <LibmpvVideo playUrl={props.videoUrl} styles={styles.videoInside} />
        </C.Modal>
    )
    return <Text style={{ color: 'white' }}>Getting video info...</Text>
}
