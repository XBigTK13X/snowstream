import React from 'react';
import { Platform } from 'react-native';
import util from './util'
import { config } from './settings'
import { routes } from './routes'
import { useDebouncedCallback } from 'use-debounce'
import { useAppContext } from '../app-context'
import {
    Platform,
    useTVEventHandler,
} from 'react-native'

const PlayerContext = React.createContext({});

export function usePlayerContext() {
    const value = React.useContext(PlayerContext);
    if (!value) {
        throw new Error('usePlayerContext must be wrapped in a <PlayerContextProvider />');
    }
    return value;
}

export function PlayerContextProvider(props) {
    const localParams = C.useLocalSearchParams()
    const { clientOptions } = useAppContext()

    const [isPlaying, setIsPlaying] = React.useState(false)
    const [completeOnResume, setCompleteOnResume] = React.useState(false)
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [countedWatch, setCountedWatch] = C.React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const [playbackFailed, setPlaybackFailed] = C.React.useState(null)

    const [videoUrl, setVideoUrl] = C.React.useState(null)
    const [videoTitle, setVideoTitle] = C.React.useState(null)
    const [videoLoaded, setVideoLoaded] = C.React.useState(false)

    const [initialSeekComplete, setInitialSeekComplete] = C.React.useState(false)
    const initialSeekRef = C.React.useRef(initialSeekComplete)
    const initialSeekSeconds = localParams.seekToSeconds ? Math.floor(localParams.seekToSeconds) : 0

    const [manualSeekSeconds, setManualSeekSeconds] = C.React.useState(0)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
    const [seekToSeconds, setSeekToSeconds] = React.useState(1)
    const [throttledProgressSeconds, setProgressSeconds] = C.React.useState(0)
    const [durationSeconds, setDurationSeconds] = C.React.useState(0.0)
    const durationRef = C.React.useRef(durationSeconds)

    const [logs, setLogs] = React.useState([])

    const [tracks, setTracks] = C.React.useState(null)

    const [audioDelaySeconds, setAudioDelaySeconds] = React.useState(0)
    const [audioTrackIndex, setAudioTrackIndex] = C.React.useState(0)

    const [subtitleColor, setSubtitleColor] = React.useState({ shade: 1.0, alpha: 1.0 })
    const [subtitleDelaySeconds, setSubtitleDelaySeconds] = React.useState(0)
    const [subtitleFontSize, setSubtitleFontSize] = React.useState(42)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = C.React.useState(0)


    const pathname = C.usePathname()

    const forcePlayer = localParams.forcePlayer
    let forceExo = false
    if (forcePlayer === 'exo') {
        forceExo = true
    }
    else if (localParams.videoIsHdr && forcePlayer !== 'mpv') {
        forceExo = true
    }
    else if (clientOptions.alwaysUseExoPlayer) {
        forceExo = true
    }

    let shouldTranscode = false
    if (localParams.transcode) {
        shouldTranscode = localParams.transcode
    }
    if (clientOptions.alwaysTranscode) {
        shouldTranscode = true
    }

    let progressPercent = null
    let progressDisplay = null
    let durationDisplay = null

    if (props.durationSeconds > 0) {
        progressPercent = 100 * (props.progressSeconds / props.durationSeconds)
        progressDisplay = util.secondsToTimestamp(props.progressSeconds)
        durationDisplay = util.secondsToTimestamp(props.durationSeconds)
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

    const onVideoReady = () => {
        setIsReady(true)
        setIsPlaying(true)
    }

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
            if (props.isTranscode) {
                setSeekToSeconds(props.initialSeekSeconds)
                setProgressSeconds(props.initialSeekSeconds)
                props.onReadyToSeek()
            }
            else {
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
        }

        if (info && info.kind && info.kind === 'rnvevent') {
            if (info.data) {
                if (info.data.data && info.data.data.currentTime) {
                    // When this fires during a transcode, it needs to be offset by the manual seek amount
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
                    // When this fires during a transcode, it needs to be offset by the manual seek amount
                    let seconds = mpvEvent.value
                    if (props.isTranscode) {
                        if (props.initialSeekSeconds && !props.manualSeekSeconds) {
                            seconds += props.initialSeekSeconds
                        }
                        else {
                            seconds += props.manualSeekSeconds
                        }
                    }
                    setProgressSeconds(seconds)
                    if (props.onProgress) {
                        props.onProgress(seconds)
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

    C.React.useEffect(() => {
        if (!videoLoaded) {
            if (localParams.audioTrack) {
                setAudioTrackIndex(parseInt(localParams.audioTrack), 10)
            }
            if (localParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(localParams.subtitleTrack), 10)
            }
            if (shouldTranscode) {
                if (props.loadTranscode) {
                    props.loadTranscode(apiClient, localParams, clientOptions.deviceProfile, initialSeekSeconds)
                        .then(loadVideo)
                }
            }
            else {
                if (props.loadVideo) {
                    props.loadVideo(apiClient, localParams)
                        .then(loadVideo)
                }
            }
        }
    })

    const loadVideo = (response) => {
        if (response.url) {
            setVideoUrl(response.url)
        }
        if (response.name) {
            setVideoTitle(response.name)
        }
        if (response.durationSeconds) {
            setDurationSeconds(response.durationSeconds)
            durationRef.current = response.durationSeconds
        }
        if (response.tracks) {
            setTracks(response.tracks)
        }
        setVideoLoaded(true)
    }

    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            if (audioTrackIndex === track.audio_index) {
                setAudioTrackIndex(-1)
            } else {
                setAudioTrackIndex(track.audio_index)
            }
        }
        if (track.kind === 'subtitle') {
            if (subtitleTrackIndex === track.subtitle_index) {
                setSubtitleTrackIndex(-1)
            } else {
                setSubtitleTrackIndex(track.subtitle_index)
            }
        }
    }

    const onReadyToSeek = () => {
        if (!initialSeekRef.current) {
            initialSeekRef.current = true
            setInitialSeekComplete(true)
        }
    }

    const onSeek = (seekedToSeconds) => {
        return onProgress(seekedToSeconds, true)
    }

    const onProgress = (progressSeconds, manualSeek) => {
        if (manualSeek || Math.abs(progressSeconds - throttledProgressSeconds) >= config.progressMinDeltaSeconds) {
            setProgressSeconds(progressSeconds)
            const duration = durationRef.current
            if (duration > 0 && progressSeconds > 0) {
                if (props.updateProgress) {
                    return props.updateProgress(apiClient, localParams, progressSeconds, duration)
                        .then((isWatched) => {
                            if (isWatched && !countedWatch) {
                                setCountedWatch(true)
                                if (props.increaseWatchCount) {
                                    return props.increaseWatchCount(apiClient)
                                }
                            }
                        })
                }
            }
            // Transcode streams have no seek capability
            // Destroy and create a new one instead at the requested timestamp
            if (shouldTranscode && manualSeek) {
                if (props.loadTranscode) {
                    setManualSeekSeconds(progressSeconds)
                    props.loadTranscode(apiClient, localParams, clientOptions.deviceProfile, progressSeconds)
                        .then(loadVideo)
                }
            }
        }
        return new Promise((resolve) => { resolve() })
    }

    const onError = (err) => {
        if (!props.transcode) {
            setVideoLoaded(false)
            routes.replace(pathname, { ...localParams, ...{ transcode: true } })
        }
        else {
            setPlaybackFailed(err)
        }
    }

    const onComplete = () => {
        const duration = durationRef.current
        onProgress(duration).then(() => {
            if (props.onComplete) {
                props.onComplete(apiClient, routes)
            } else {
                routes.back()
            }
        })
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

    const info = {
        audioDelay: audioDelaySeconds,
        audioTrackIndex: audioTrackIndex,
        controlsVisible: controlsVisible,
        durationSeconds: durationSeconds,
        forceExoPlayer: forceExo,
        initialSeekComplete: initialSeekRef,
        initialSeekSeconds: initialSeekSeconds,
        isPlaying: isPlaying,
        isReady: isReady,
        isTranscode: shouldTranscode,
        logs: logs,
        manualSeekSeconds: manualSeekSeconds,
        playerKind: playerKind,
        progressSeconds: progressSeconds,
        progressPercent: progressPercent,
        progressDisplay: progressDisplay,
        durationDisplay: durationDisplay,
        seekToSeconds: seekToSeconds,
        subtitleColor: subtitleColor,
        subtitleDelay: subtitleDelaySeconds,
        subtitleFontSize: subtitleFontSize,
        subtitleTrackIndex: subtitleTrackIndex,
        tracks: tracks,
        videoHeight: clientOptions.resolutionHeight,
        videoTitle: videoTitle,
        videoUrl: videoUrl,
        videoWidth: clientOptions.resolutionWidth
    }

    const action = {
        onComplete: onComplete,
        onError: onError,
        onError: onVideoError,
        onProgress: onProgress,
        onReady: onVideoReady,
        onReadyToSeek: onReadyToSeek,
        onSeek: onSeek,
        onUpdate: onVideoUpdate,
        selectTrack: selectTrack,
        setAudioDelay: setAudioDelaySeconds,
        setSubtitleColor: setSubtitleColor,
        setSubtitleDelay: setSubtitleDelaySeconds,
        setSubtitleFontSize: setSubtitleFontSize,
        stopVideo: stopVideo,
        pauseVideo: pauseVideo,
        resumeVideo: resumeVideo,
        selectTrack: props.selectTrack
    }

    const playerContext = {
        info,
        action
    }

    return (
        <PlayerContext.Provider
            value={playerContext}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export default PlayerContextProvider