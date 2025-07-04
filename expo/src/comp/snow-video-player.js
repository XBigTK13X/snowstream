import React from 'react'
import { Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppContext } from '../app-context'
import { StaticStyle } from '../snow-style'
import SnowVideoControls from './snow-video-controls'
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
    const router = useRouter()
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
    const [seekToSeconds, setSeekToSeconds] = React.useState(null)
    const [completeOnResume, setCompleteOnResume] = React.useState(false)
    const [logs, setLogs] = React.useState([])
    const [initialSeekComplete, setInitialSeekComplete] = React.useState(false)
    const [subtitleFontSize, setSubtitleFontSize] = React.useState(38) // MPV default font size
    const [subtitleColor, setSubtitleColor] = React.useState({ shade: 1.0, alpha: 1.0 })


    let VideoView = null
    let playerKind = null
    if (config.useNullVideoView) {
        VideoView = require('./null-video-view').default
    }
    else {
        if (Platform.OS === 'web' || props.forceExoPlayer) {
            VideoView = require('./rnv-video-view').default
            playerKind = 'rnv'
        }
        else {
            VideoView = require('./mpv-video-view').default
            playerKind = 'mpv'
        }
    }

    const showControls = () => {
        console.log("Showing controls")
        setControlsVisible(true)
        setIsPlaying(false)
    }

    const hideControls = () => {
        console.log("Hiding controls")
        setControlsVisible(false)
        setIsPlaying(true)
        if (completeOnResume) {
            if (props.onComplete) {
                props.onComplete()
            }
        }
    }

    const addLog = (logEvent) => {
        try {
            logs.push(JSON.stringify(logEvent))
            setLogs(logs)
        }
        catch {

        }
    }

    const onVideoUpdate = (info) => {
        if (config.debugVideoPlayer) {
            console.log({ info })
        }

        if (props.initialSeekSeconds && !initialSeekComplete) {
            if (playerKind === 'mpv') {
                if (info && info.libmpvLog && info.libmpvLog.text && info.libmpvLog.text.indexOf('audio ready') !== -1) {
                    setInitialSeekComplete(true)
                    immediateSeek(0, props.initialSeekSeconds)
                }
            }
            else if (playerKind === 'rnv') {
                if (info && info.kind === 'rnvevent' && info.data.event === 'onReady') {
                    setInitialSeekComplete(true)
                    immediateSeek(0, props.initialSeekSeconds)
                }
            }
        }

        if (info && info.kind && info.kind === 'rnvevent') {
            if (info.data) {
                if (info.data.currentTime) {
                    setProgressSeconds(info.data.currentTime)
                    if (props.onProgress) {
                        props.onProgress(info.data.currentTime)
                    }
                }
                else {
                    addLog(info)
                }
                if (info.data.playbackFinished) {
                    if (props.onComplete) {
                        props.onComplete()
                    }
                }
            }
        }
        else if (info && info.kind && info.kind === 'mpvevent') {
            let mpvEvent = info.libmpvEvent
            if (mpvEvent.property) {
                if (mpvEvent.property === 'time-pos') {
                    setProgressSeconds(mpvEvent.value)
                    if (props.onProgress) {
                        props.onProgress(mpvEvent.value)
                    }
                }
                else {
                    if (mpvEvent.property !== 'demuxer-cache-time') {
                        addLog(info)
                    }
                }
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) {
                    if (props.onComplete) {
                        props.onComplete()
                    }
                }
            }
        }
        else if (info && info.kind && info.kind === 'nullevent') {
            const nullEvent = info.nullEvent
            if (nullEvent.progress) {
                setProgressSeconds(nullEvent.progress)
            }
            else {
                addLog(info)
            }
        }

        else {
            addLog(info)
        }
    }

    const onVideoError = (err) => {
        if (config.debugVideoPlayer) {
            console.log({ err })
        }

        addLog(err)

        if (props.onError) {
            if (err && err.kind && err.kind == 'rnv') {
                if (err.error.code === 4) {
                    props.onError(err)
                }
                if (err.error.code === 24001) {
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

    const immediateSeek = (progressPercent, progressSeconds) => {
        if (!progressSeconds) {
            progressSeconds = (progressPercent / 100) * props.durationSeconds
        }
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
    }

    const onVideoReady = () => {
        setIsReady(true)
        setIsPlaying(true)
    }

    const onSeek = useDebouncedCallback(immediateSeek, config.debounceMilliseconds)

    let controlToggleButton = null
    if (isReady) {
        controlToggleButton = (
            <TouchableOpacity
                style={styles.videoOverlay}
                onPress={showControls} />
        )
    }


    if (!props.videoUrl) {
        return null
    }

    if (config.debugVideoPlayer) {
        console.log(props.videoUrl)
    }

    return (
        <View style={styles.dark}>
            <VideoView
                showControls={showControls}
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
                subtitleFontSize={subtitleFontSize}
                subtitleColor={subtitleColor}
            />
            <Modal
                visible={controlsVisible}
                onRequestClose={() => {
                    setControlsVisible(false)
                    setIsPlaying(true)
                }}
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
                    logs={logs}
                    setSubtitleFontSize={setSubtitleFontSize}
                    setSubtitleColor={setSubtitleColor}
                />
            </Modal>
        </View >
    )
}