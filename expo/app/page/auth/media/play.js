import React from 'react'
import { Dimensions, View, Text, StyleSheet, Platform } from 'react-native'
import { Button, ListItem } from '@rneui/themed'

import { useLocalSearchParams, useFocusEffect, useNavigation } from 'expo-router'
import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

// TODO This is super janky. I think the entire view needs to be pulled out of the layout to work
// Pass in the needed parts for auth
var styles = StyleSheet.create({
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
    const [episode, setEpisode] = React.useState(null)
    const [videoUrl, setVideoUrl] = React.useState(null)
    const [mpvDestroyed, setMpvDestroyed] = React.useState(false)
    let Libmpv = null
    let LibmpvVideo = null
    if (Platform.OS != 'web') {
        libmpv = require('react-native-libmpv')
        Libmpv = libmpv.Libmpv
        LibmpvVideo = libmpv.LibmpvVideo
    }

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
            <View style={styles.videoView}>
                <LibmpvVideo playUrl={devVideoUrl ? devVideoUrl : videoUrl.path} />
            </View>
        )
    }
    return <Text style={{ color: 'white' }}>Getting video info...</Text>
}
