import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSettings } from '../settings-context'
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
        backgroundColor: 'black',
    },
    controlsModal: {
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    videoControls: {
        width: windowWidth,
        height: windowHeight
    },
    dark: {
        backgroundColor: 'black',
    }
})

export default function SnowVideoPlayer(props) {
    const { config } = useSettings()
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const [SubMenu, setSubMenu] = React.useState(null)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
    const [seekToSeconds, setSeekToSeconds] = React.useState(0)
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
        console.log({ info })
        if (config.debugVideoPlayer) {
            console.log({ info })
        }

        if (info && info.kind && info.kind === 'rnvevent') {
            if (info.data && info.data.currentTime) {
                setProgressSeconds(info.data.currentTime)
                if (props.onProgress) {
                    props.onProgress(info.data.currentTime)
                }
            }
        }

        if (info && info.kind && info.kind === 'mpvevent') {
            let mpvEvent = info.libmpvEvent
            if (mpvEvent.property) {
                if (mpvEvent.property === 'time-pos') {
                    setProgressSeconds(mpvEvent.value)
                    if (props.onProgress) {
                        props.onProgress(mpvEvent.value)
                    }
                }
                if (mpvEvent.property === 'eof-reached') {
                    if (props.onComplete) {
                        props.onComplete()
                    }
                }
            }
        }
        if (info && info.kind && info.kind === 'nullevent') {
            const nullEvent = info.nullEvent
            if (nullEvent.progress) {
                setProgressSeconds(nullEvent.progress)
            }
        }
    }

    const onVideoError = (err) => {
        if (config.debugVideoPlayer) {
            console.log({ err })
        }

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
        console.log({ progressPercent })
        const progressSeconds = (progressPercent / 100) * props.durationSeconds
        if (props.onSeek) {
            props.onSeek(progressSeconds)
        }
        setSeekToSeconds(progressSeconds)
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
    if (config.useNullVideoView) {
        VideoView = require('./null-video-view').default
    }
    else {
        if (Platform.OS !== 'web') {
            VideoView = require('./mpv-video-view').default
        }
        else {
            VideoView = require('./rnv-video-view').default
        }
    }


    if (!props.videoUrl) {
        return null
    }

    if (config.debugVideoView) {
        console.log(props.videoUrl)
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
                        seekToSeconds={seekToSeconds}
                    />
                    {controlToggleButton}
                </View>
            </Modal >
            <Modal
                visible={controlsVisible}
                transparent
            >
                <View style={styles.videoControls}>
                    <SnowVideoControls
                        hideControls={hideControls}
                        selectTrack={props.selectTrack}
                        audioTrack={props.audioIndex}
                        subtitleTrack={props.subtitleIndex}
                        tracks={props.tracks}
                        progressSeconds={progressSeconds}
                        durationSeconds={props.durationSeconds}
                        onSeek={onSeek}
                    />
                </View>
            </Modal>
        </View >
    )
}