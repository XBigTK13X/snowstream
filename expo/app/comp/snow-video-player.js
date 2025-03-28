import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import SnowText from './snow-text'
import SnowButton from './snow-button'
import SnowGrid from './snow-grid'

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    videoOverlay: {
        backgroundColor: 'transparent',
        width: windowWidth,
        height: windowHeight,
    },
    videoView: {
        width: windowWidth,
        height: windowHeight,
        backgroundColor: 'black'
    },
    dark: {
        backgroundColor: 'black'
    }
})

export default function SnowVideoPlayer(props) {
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const router = useRouter()

    const showControls = () => {
        setControlsVisible(true)
        setIsPlaying(false)
    }

    const hideControls = () => {
        setControlsVisible(false)
        setIsPlaying(true)
    }

    const onVideoUpdate = (info) => {
        //console.log({ info })
    }

    const onVideoError = (err) => {
        //console.log({ err })
    }

    const onVideoReady = () => {
        setIsReady(true)
        setIsPlaying(true)
    }

    let controlToggleButton = null
    if (isReady) {
        controlToggleButton = (
            <TouchableOpacity
                style={styles.videoOverlay}
                onPress={showControls} />
        )
    }

    let VideoView = null
    if (Platform.OS !== 'web') {
        VideoView = require('./mpv-video-view').default
    }
    else {
        VideoView = require('./rnv-video-view').default
    }

    const buttons = [
        <SnowButton hasTVPreferredFocus={true} title="Resume" onPress={hideControls} />,
        <SnowButton title="Subtitles" onPress={hideControls} />,
        <SnowButton title="Audio" onPress={hideControls} />
    ]

    // Make the controls transparent, so you can see the scrubbing

    return (
        <View style={styles.dark}>
            <Modal
                onRequestClose={() => {
                    setControlsVisible(false)
                    setIsPlaying(false)
                    router.back()
                }}
            >
                <View style={styles.videoView}>
                    <VideoView
                        windowHeight={windowHeight}
                        windowWidth={windowWidth}
                        videoUrl={props.videoUrl}
                        isPlaying={isPlaying}
                        isReady={isReady}
                        onUpdate={onVideoUpdate}
                        onError={onVideoError}
                        onReady={onVideoReady} />
                    {controlToggleButton}
                </View>
            </Modal >
            <Modal
                visible={controlsVisible}
            >
                <View style={styles.videoView}>
                    <SnowGrid data={buttons} renderItem={(item) => item} />
                </View>
            </Modal>
        </View >
    )
}