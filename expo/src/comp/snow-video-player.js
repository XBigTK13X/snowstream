import React from 'react'
import util from '../util'
import {
    AppState,
    Platform,
    View,
    useTVEventHandler,
} from 'react-native'
import { useKeepAwake } from 'expo-keep-awake';
import { useAppContext } from '../app-context'
import Style from '../snow-style'
import SnowVideoControls from './snow-video-controls'
import { useDebouncedCallback } from 'use-debounce'

export default function SnowVideoPlayer(props) {
    const styles = {
        videoOverlay: {
            backgroundColor: 'transparent',
            width: Style.window.width(),
            height: Style.window.height(),
        },
        videoView: {
            width: Style.window.width(),
            height: Style.window.height(),
            backgroundColor: Style.color.background,
        },
        videoControls: {
            flex: 1
        },
        dark: {
            backgroundColor: Style.color.background,
        }
    }
    const { config, routes, clientOptions } = useAppContext()
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
    const [seekToSeconds, setSeekToSeconds] = React.useState(1)
    const [completeOnResume, setCompleteOnResume] = React.useState(false)
    const [logs, setLogs] = React.useState([])
    const [subtitleFontSize, setSubtitleFontSize] = React.useState(42)
    const [subtitleColor, setSubtitleColor] = React.useState({ shade: 1.0, alpha: 1.0 })
    const [subtitleDelaySeconds, setSubtitleDelaySeconds] = React.useState(0)
    const [audioDelaySeconds, setAudioDelaySeconds] = React.useState(0)

    useKeepAwake();

    let VideoView = null
    let playerKind = null
    if (config.useNullVideoView) {
        VideoView = require('./null-video-view').default
        playerKind = 'null'
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

    const pauseVideo = () => {
        setControlsVisible(true)
        setIsPlaying(false)
    }

    const resumeVideo = () => {
        setControlsVisible(false)
        setIsPlaying(true)
        if (completeOnResume) {
            if (props.onComplete) {
                props.onComplete()
            }
        }
    }

    const stopVideo = (goHome) => {
        setControlsVisible(false)
        setIsPlaying(false)
        if (goHome) {
            routes.goto(routes.landing)
        }
        else {
            routes.back()
        }
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                stopVideo()
            }
        });

        return () => {
            appStateSubscription.remove();
        };
    }, []);

    const addLog = (logEvent) => {
        try {
            logs.push(JSON.stringify(logEvent))
            setLogs(logs)
        }
        catch {

        }
    }

    const immediateSeek = (progressPercent, progressSeconds) => {
        if (progressSeconds < 0) {
            progressSeconds = 0
        }
        if (props.durationSeconds) {
            if (progressSeconds > props.durationSeconds) {
                progressSeconds = props.durationSeconds
            }
        }
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

    const onSeek = useDebouncedCallback(immediateSeek, config.debounceMilliseconds)

    const onVideoUpdate = (info) => {
        if (config.debugVideoPlayer) {
            util.log({ info })
        }

        if (!props.initialSeekComplete.current && props.initialSeekSeconds) {
            if (playerKind === 'mpv') {
                if (info && info.libmpvLog && info.libmpvLog.text && info.libmpvLog.text.indexOf('Starting playback') !== -1) {
                    setSeekToSeconds(props.initialSeekSeconds)
                    setProgressSeconds(props.initialSeekSeconds)
                    props.onReadyToSeek()
                }
            }
            else if (playerKind === 'rnv') {
                if (info && info.kind === 'rnvevent' && info.data.event === 'onReadyForDisplay') {
                    setSeekToSeconds(props.initialSeekSeconds)
                    setProgressSeconds(props.initialSeekSeconds)
                    props.onReadyToSeek()
                }
            }
        }

        if (info && info.kind && info.kind === 'rnvevent') {
            if (info.data) {
                if (info.data.data && info.data.data.currentTime) {
                    setProgressSeconds(info.data.data.currentTime)
                    if (props.onProgress) {
                        props.onProgress(info.data.data.currentTime)
                    }
                }
                else {
                    addLog(info)
                }
                if (info.data.event === 'onEnd') {
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
                    if (mpvEvent.property !== 'demuxer-cache-time' && mpvEvent.property !== 'track-list') {
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
            if (info.libmpvLog && info.libmpvLog.text && info.libmpvLog.text.indexOf('Description:') === -1) {
                addLog(info)
            }
        }
    }

    const onVideoError = (err) => {
        if (config.debugVideoPlayer) {
            util.log({ err })
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
                    util.log("Unhandled error kind")
                    util.log({ err })
                }
            }
            else {
                util.log("Unhandled error source")
                util.log({ err })
            }
        }
    }

    const onVideoReady = () => {
        setIsReady(true)
        setIsPlaying(true)
    }

    if (!props.videoUrl) {
        return null
    }

    if (config.debugVideoPlayer) {
        util.log(props.videoUrl)
    }

    if (Platform.isTV) {
        const tvRemoteHandler = (remoteEvent) => {
            if (!controlsVisible && isReady) {
                if (props.initialSeekComplete.current || !props.initialSeekSeconds) {
                    if (remoteEvent.eventType === 'right') {
                        immediateSeek(null, progressSeconds + 90)
                    }
                    else if (remoteEvent.eventType === 'left') {
                        immediateSeek(null, progressSeconds - 5)
                    }
                    else if (remoteEvent.eventType === 'down') {
                        setSubtitleFontSize((fontSize) => { return fontSize -= 4 })
                    }
                    else if (remoteEvent.eventType === 'up') {
                        setSubtitleColor((fontColor) => {
                            newColor = { ...fontColor }
                            newColor.shade -= 0.15;
                            if (newColor.shade < 0) {
                                newColor.shade = 0.0
                            }
                            return newColor
                        })
                    }
                }
            };
        }
        useTVEventHandler(tvRemoteHandler);
    }

    return (
        <View style={styles.dark}>
            <VideoView
                videoWidth={clientOptions.resolutionWidth}
                videoHeight={clientOptions.resolutionHeight}
                videoUrl={props.videoUrl}
                isPlaying={isPlaying}
                isReady={isReady}
                isTranscode={props.isTranscode}
                seekToSeconds={seekToSeconds}
                audioIndex={props.audioIndex}
                audioDelay={audioDelaySeconds}
                subtitleIndex={props.subtitleIndex}
                subtitleFontSize={subtitleFontSize}
                subtitleColor={subtitleColor}
                subtitleDelay={subtitleDelaySeconds}
                onUpdate={onVideoUpdate}
                onError={onVideoError}
                onReady={onVideoReady}
                pauseVideo={pauseVideo}
                stopVideo={stopVideo}
            />
            <SnowVideoControls
                controlsVisible={controlsVisible}
                playerKind={playerKind}
                videoTitle={props.videoTitle}
                tracks={props.tracks}
                audioTrack={props.audioIndex}
                audioDelay={audioDelaySeconds}
                setAudioDelay={setAudioDelaySeconds}
                subtitleTrack={props.subtitleIndex}
                setSubtitleFontSize={setSubtitleFontSize}
                setSubtitleColor={setSubtitleColor}
                subtitleDelay={subtitleDelaySeconds}
                setSubtitleDelay={setSubtitleDelaySeconds}
                progressSeconds={progressSeconds}
                durationSeconds={props.durationSeconds}
                onSeek={onSeek}
                logs={logs}
                selectTrack={props.selectTrack}
                resumeVideo={resumeVideo}
                stopVideo={stopVideo}
            />
        </View >
    )
}