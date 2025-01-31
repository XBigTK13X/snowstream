import C from '../common'

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

export default function PlayerMpv(props) {
    const navigation = C.useNavigation()
    let libmpv = require('react-native-libmpv')
    let Libmpv = libmpv.Libmpv
    let LibmpvVideo = libmpv.LibmpvVideo

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
        return (
            <C.View style={styles.videoView}>
                <LibmpvVideo playUrl={props.videoUrl} />
            </C.View>
        )
    }
    return <Text style={{ color: 'white' }}>Getting video info...</Text>
}
