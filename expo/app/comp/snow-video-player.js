import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import SnowVideoControls from './snow-video-controls'
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
    const [SubMenu, setSubMenu] = React.useState(null)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
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
        if (info && info.kind && info.kind === 'mpvevent') {
            let mpvEvent = info.libmpvEvent
            if (mpvEvent.property && mpvEvent.property === 'time-pos') {
                setProgressSeconds(mpvEvent.value)
                if (props.onProgress) {
                    props.onProgress(mpvEvent.value)
                }
            }
        }
    }

    const onVideoError = (err) => {
        console.log({ err })
        if (props.onError) {
            if (err && err.kind && err.kind == 'rnv') {
                if (err.error.code === 4) {
                    props.onError(err)
                }
                else {
                    console.log("Unhandled error kind")
                }
            }
            else {
                console.log("Unhandled error source")
            }
        }
    }

    const onVideoReady = () => {
        setIsReady(true)
        setIsPlaying(true)
    }

    const onSeek = (progressPercent) => {
        if (props.onSeek) {
            props.onSeek(progressPercent)
        }
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
    // TODO If using the web player and any track other than 0/0 is selected, then transcode
    if (Platform.OS !== 'web') {
        VideoView = require('./mpv-video-view').default
    }
    else {
        VideoView = require('./rnv-video-view').default
    }

    if (!props.tracks) {
        return null
    }

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
                        isTranscode={props.isTranscode}
                        onUpdate={onVideoUpdate}
                        onError={onVideoError}
                        onReady={onVideoReady}
                        subtitleIndex={props.subtitleIndex}
                        audioIndex={props.audioIndex}
                    />
                    {controlToggleButton}
                </View>
            </Modal >
            <Modal
                visible={controlsVisible}
            >
                <View style={styles.videoView}>
                    <SnowVideoControls
                        hideControls={hideControls}
                        selectTrack={props.selectTrack}
                        audioTrack={props.audioIndex}
                        subtitleTrack={props.subtitleIndex}
                        tracks={props.tracks}
                        progressSeconds={progressSeconds}
                        durationSeconds={props.durationSeconds}
                        onSeek={props.onSeek}
                    />
                </View>
            </Modal>
        </View >
    )
}