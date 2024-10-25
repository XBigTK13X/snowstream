import React from 'react'
import { Dimensions, View, Text, StyleSheet } from 'react-native'
import { Button, ListItem } from '@rneui/themed'

import { useLocalSearchParams, useFocusEffect, useNavigation } from 'expo-router'
import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

import { LibmpvVideo, Libmpv } from 'react-native-libmpv'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

// TODO This is super janky. I think the entire view needs to be pulled out of the layout to work
// Pass in the needed parts for auth
var styles = StyleSheet.create({
    videoBackdrop: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: windowWidth,
        height: windowHeight,
        elevation: 900,
        backgroundColor: '#000000',
    },
    videoBackdropTwo: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: windowWidth,
        height: windowHeight,
        elevation: 900,
        backgroundColor: '#000000',
    },
    videoView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: windowWidth,
        height: windowHeight,
        elevation: 1000,
    },
    videoViewOld: {
        position: 'absolute',
        top: 1,
        left: 1,
        bottom: 1,
        right: 1,
        width: windowWidth - 2,
        height: windowHeight - 2,
        elevation: 1000,
    },
})

// https://thewidlarzgroup.github.io/react-native-video#v600-information

export default function PlayMediaPage() {
    const videoRef = React.useRef(null)
    const { signOut, apiClient } = useSession()
    const { routes } = useSettings()
    const localParams = useLocalSearchParams()
    const navigation = useNavigation()

    const shelfId = localParams.shelfId
    const movieId = localParams.movieId
    const episodeId = localParams.episodeId
    const streamableId = localParams.streamableId
    const videoFileIndex = localParams.videoFileIndex

    const [shelf, setShelf] = React.useState(null)
    const [movie, setMovie] = React.useState(null)
    const [videoUrl, setVideoUrl] = React.useState(null)
    const [mpvDestroyed, setMpvDestroyed] = React.useState(false)

    React.useEffect(() => {
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
        if (!videoUrl && streamableId) {
            apiClient.getStreamable(streamableId).then((response) => {
                setVideoUrl({ path: response.url })
            })
        }
    })

    React.useEffect(() => {
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
        const mkvUrl = "http://192.168.1.4:8000/media/movies/testing/Ocean's Eleven (2001)/Ocean's Eleven (2001) WEBDL-480p.mkv"
        const frigateUrl = 'http://192.168.1.4:8000/api/streamable/direct?streamable_id=68'
        const hdHomeRunUrl = 'http://192.168.1.4:8000/api/streamable/direct?streamable_id=1'
        const hdHomeRunUrlTrans = 'http://192.168.1.4:8000/api/streamable/transcode?streamable_id=1'
        const iptvUrl = 'http://192.168.1.4:8000/api/streamable/direct?streamable_id=124'
        //devVideoUrl = frigateUrl
        //console.log({ devVideoUrl })
        //console.log({ videoUrl })
        return (
            <View style={styles.videoBackdrop}>
                <View style={styles.videoBackdropTwo}>
                    <View style={styles.videoView}>
                        <LibmpvVideo playUrl={devVideoUrl ? devVideoUrl : videoUrl.path} />
                    </View>
                </View>
            </View>
        )
    }
    return <Text>Playing video...</Text>
}
