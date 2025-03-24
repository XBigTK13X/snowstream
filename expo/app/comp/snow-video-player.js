import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import SnowText from './snow-text'
import SnowButton from './snow-button'

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    videoOverlay: {
        backgroundColor: 'transparent',
        width: windowWidth,
        height: windowHeight,
    }
})

export default function SnowVideoPlayer(props) {
    const [videoVisible, setVideoVisible] = React.useState(true)
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)

    const showControls = () => {
        setControlsVisible(true)
        setIsPlaying(false)
    }

    const hideControls = () => {
        setControlsVisible(false)
        setIsPlaying(true)
    }

    const onVideoUpdate = (info) => {
        console.log({ info })
    }

    const onVideoError = (err) => {
        console.log({ err })
    }

    const onVideoReady = () => {
        console.log("Ready")
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

    return (
        <View>
            <Modal
                visible={videoVisible}
                onRequestClose={() => {
                    setVideoVisible(false)
                    setControlsVisible(false)
                    setIsPlaying(false)
                }}
            >
                <View style={{ backgroundColor: 'black' }}>
                    <VideoView
                        windowHeight={windowHeight}
                        videoUrl={props.videoUrl}
                        isPlaying={isPlaying}
                        onUpdate={onVideoUpdate}
                        onError={onVideoError}
                        onReady={onVideoReady} />
                    {controlToggleButton}
                </View>
            </Modal >
            <Modal
                visible={controlsVisible}
            >
                <View>
                    <SnowText>Well, this was easier than expected.</SnowText>
                    <SnowButton title="Press to close" onPress={hideControls} />
                </View>
            </Modal>
        </View >
    )
}