import React from 'react'
import { Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppContext } from '../app-context'
import { StaticStyle } from '../snow-style'
import SnowVideoControls from './snow-video-controls'
import FillView from './fill-view'
import { useDebouncedCallback } from 'use-debounce'
const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = {
    videoOverlay: {
        backgroundColor: 'transparent',
        width: windowWidth,
        height: windowHeight,
    },
    videoView: {
        width: windowWidth,
        height: windowHeight,
        backgroundColor: StaticStyle.color.background,
    },
    videoControls: {
        flex: 1
    },
    dark: {
        backgroundColor: StaticStyle.color.background,
    }
}

export default function SnowVideoPlayer(props) {
    const { config } = useAppContext()
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
    const [seekToSeconds, setSeekToSeconds] = React.useState(0)
    const [completeOnResume, setCompleteOnResume] = React.useState(false)
    const router = useRouter()


    const showControls = () => {
        setControlsVisible(true)
        setIsPlaying(false)
    }

    const hideControls = () => {
        setControlsVisible(false)
        setIsPlaying(true)
        if (completeOnResume) {
            if (props.onComplete) {
                props.onComplete()
            }
        }
    }

    const onVideoUpdate = (info) => {
        if (config.debugVideoPlayer) {
            console.log({ info })
        }

        if (info && info.kind && info.kind === 'rnvevent') {
            if (info.data) {
                if (info.data.currentTime) {
                    setProgressSeconds(info.data.currentTime)
                    if (props.onProgress) {
                        props.onProgress(info.data.currentTime)
                    }
                }
                if (info.data.playbackFinished) {
                    if (props.onComplete) {
                        props.onComplete()
                    }
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
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) {
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
                    console.log({ err })
                }
            }
            else {
                console.log("Unhandled error source")
                console.log({ err })
            }
        }
    }

    const onVideoReady = () => {
        setIsReady(true)
        setIsPlaying(true)
    }

    const onSeek = useDebouncedCallback((progressPercent) => {
        const progressSeconds = (progressPercent / 100) * props.durationSeconds
        if (progressPercent >= 100) {
            setCompleteOnResume(true)
        } else {
            setCompleteOnResume(false)
            if (props.onSeek) {
                props.onSeek(progressSeconds)
            }
        }
        setSeekToSeconds(progressSeconds)
        setProgressSeconds(progressSeconds)
    }, config.debounceMilliseconds)

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
                <SnowVideoControls
                    videoTitle={props.videoTitle}
                    hideControls={hideControls}
                    selectTrack={props.selectTrack}
                    audioTrack={props.audioIndex}
                    subtitleTrack={props.subtitleIndex}
                    tracks={props.tracks}
                    progressSeconds={progressSeconds}
                    durationSeconds={props.durationSeconds}
                    onSeek={onSeek}
                />
            </Modal>
        </View >
    )
}