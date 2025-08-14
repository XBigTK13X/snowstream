import React from 'react';
import { Platform, useTVEventHandler } from 'react-native';
import { useLocalSearchParams, usePathname } from 'expo-router'
import { useDebouncedCallback } from 'use-debounce'
import { useAppContext } from './app-context'
import util from './util'

const PlayerContext = React.createContext({});

export function usePlayerContext() {
    const value = React.useContext(PlayerContext);
    if (!value) {
        throw new Error('usePlayerContext must be wrapped in a <PlayerContextProvider />');
    }
    return value;
}

export function PlayerContextProvider(props) {
    const localParams = useLocalSearchParams()
    const { apiClient, clientOptions, config, routes } = useAppContext()

    const [isPlaying, setIsPlaying] = React.useState(false)
    const [completeOnResume, setCompleteOnResume] = React.useState(false)
    const [controlsVisible, setControlsVisible] = React.useState(false)
    const [countedWatch, setCountedWatch] = React.useState(false)
    const [isReady, setIsReady] = React.useState(false)
    const [playbackFailed, setPlaybackFailed] = React.useState(false)

    const [videoUrl, setVideoUrl] = React.useState(null)
    const [videoTitle, setVideoTitle] = React.useState(null)
    const [videoLoaded, setVideoLoaded] = React.useState(false)

    const [initialSeekComplete, setInitialSeekComplete] = React.useState(false)
    const initialSeekSeconds = localParams.seekToSeconds ? Math.floor(localParams.seekToSeconds) : 0

    const [manualSeekSeconds, setManualSeekSeconds] = React.useState(0)
    const [progressSeconds, setProgressSeconds] = React.useState(null)
    const [seekToSeconds, setSeekToSeconds] = React.useState(1)
    const [durationSeconds, setDurationSeconds] = React.useState(0.0)

    const [logs, setLogs] = React.useState([])

    const [mediaTracks, setMediaTracks] = React.useState(null)

    const [audioDelaySeconds, setAudioDelaySeconds] = React.useState(0)
    const [audioTrackIndex, setAudioTrackIndex] = React.useState(0)

    const [subtitleColor, setSubtitleColor] = React.useState({ shade: 1.0, alpha: 1.0 })
    const [subtitleDelaySeconds, setSubtitleDelaySeconds] = React.useState(0)
    const [subtitleFontSize, setSubtitleFontSize] = React.useState(42)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = React.useState(0)


    const pathname = usePathname()

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

    let isTranscode = false
    if (localParams.transcode) {
        isTranscode = localParams.transcode
    }
    if (clientOptions.alwaysTranscode) {
        isTranscode = true
    }

    let progressPercent = null
    let progressDisplay = null
    let durationDisplay = null

    if (durationSeconds > 0) {
        progressPercent = 100 * (progressSeconds / durationSeconds)
        progressDisplay = util.secondsToTimestamp(progressSeconds)
        durationDisplay = util.secondsToTimestamp(durationSeconds)
    }

    let playerKind = null
    if (config.useNullVideoView) {
        VideoView = require('./comp/null-video-view').default
        playerKind = 'null'
    }
    else {
        if (Platform.OS === 'web' || player.info.forceExoPlayer) {
            VideoView = require('./comp/rnv-video-view').default
            playerKind = 'rnv'
        }
        else {
            VideoView = require('./comp/mpv-video-view').default
            playerKind = 'mpv'
        }
    }

    const onPauseVideo = () => {
        setControlsVisible(true)
        setIsPlaying(false)
    }

    const onPlaybackComplete = () => {
        onProgress(durationSeconds, 'playback-complete').then(() => {
            if (props.onComplete) {
                props.onComplete(apiClient, routes)
            } else {
                routes.back()
            }
        })
    }

    const onResumeVideo = () => {
        setControlsVisible(false)
        setIsPlaying(true)
        if (completeOnResume) {
            onPlaybackComplete()
        }
    }

    const onStopVideo = (goHome) => {
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

    const onAddLog = (logEvent) => {
        try {
            logs.push(JSON.stringify(logEvent))
            setLogs(logs)
        }
        catch {

        }
    }

    const onReadyToSeek = () => {
        if (!initialSeekComplete) {
            setInitialSeekComplete(true)
        }
    }

    const onProgress = (nextProgressSeconds, source, nextProgressPercent) => {
        console.log({ nextProgressSeconds, source })
        if (source === 'manual-seek') {
            if (nextProgressSeconds < 0) {
                nextProgressSeconds = 0
            }
            if (durationSeconds) {
                if (nextProgressSeconds > durationSeconds) {
                    nextProgressSeconds = durationSeconds
                }
            }
            if (!nextProgressSeconds) {
                nextProgressSeconds = (nextProgressPercent / 100) * durationSeconds
            }
            if (nextProgressPercent >= 100) {
                setCompleteOnResume(true)
            } else {
                setCompleteOnResume(false)
            }
            setSeekToSeconds(nextProgressSeconds)
        }
        if (source === 'manual-seek' || Math.abs(nextProgressSeconds - progressSeconds) >= config.progressMinDeltaSeconds) {
            setProgressSeconds(nextProgressSeconds)
            if (durationSeconds > 0 && progressSeconds > 0) {
                if (props.updateProgress) {
                    return props.updateProgress(apiClient, localParams, nextProgressSeconds, durationSeconds)
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
            if (isTranscode && manualSeek) {
                console.log("Should be transcoding to " + nextProgressSeconds)
                if (props.loadTranscode) {
                    setManualSeekSeconds(nextProgressSeconds)
                    props.loadTranscode(apiClient, localParams, clientOptions.deviceProfile, nextProgressSeconds)
                        .then(loadVideo)
                }
            }
        }
        return new Promise((resolve) => { resolve() })
    }

    const onProgressDebounced = useDebouncedCallback(onProgress, config.debounceMilliseconds)

    const onVideoUpdate = (info) => {
        if (config.debugVideoPlayer) {
            util.log({ info })
        }

        if (!initialSeekComplete && initialSeekSeconds) {
            if (isTranscode) {
                setSeekToSeconds(initialSeekSeconds)
                setProgressSeconds(initialSeekSeconds)
                onReadyToSeek()
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
                    let seconds = info.data.data.currentTime
                    if (isTranscode) {
                        if (props.initialSeekSeconds && !props.manualSeekSeconds) {
                            seconds += props.initialSeekSeconds
                        }
                        else {
                            seconds += props.manualSeekSeconds
                        }
                    }
                    setProgressSeconds(info.data.data.currentTime)
                    if (props.onProgress) {
                        props.onProgress(info.data.data.currentTime)
                    }
                }
                else {
                    onAddLog(info)
                }
                if (info.data.event === 'onEnd') {
                    if (props.onPlaybackComplete) {
                        props.onPlaybackComplete()
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
                    if (isTranscode) {
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
                        onAddLog(info)
                    }
                }
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) {
                    if (props.onPlaybackComplete) {
                        props.onPlaybackComplete()
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
                onAddLog(info)
            }
        }

        else {
            if (info.libmpvLog && info.libmpvLog.text && info.libmpvLog.text.indexOf('Description:') === -1) {
                onAddLog(info)
            }
        }
    }

    const onCriticalError = (err) => {
        if (!props.transcode) {
            setVideoLoaded(false)
            routes.replace(pathname, { ...localParams, ...{ transcode: true } })
        }
        else {
            setPlaybackFailed(err)
        }
    }

    const onVideoError = (err) => {
        if (config.debugVideoPlayer) {
            util.log({ err })
        }

        onAddLog(err)

        if (props.onError) {
            if (err && err.kind && err.kind == 'rnv') {
                if (err.error.code === 4) {
                    onCriticalError(err)
                }
                if (err.error.code === 24001) {
                    onCriticalError(err)
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

    const loadVideo = (response) => {
        if (response.url) {
            setVideoUrl(response.url)
        }
        if (response.name) {
            setVideoTitle(response.name)
        }
        if (response.durationSeconds) {
            setDurationSeconds(response.durationSeconds)
        }
        if (response.tracks) {
            setMediaTracks(response.tracks)
        }
        setVideoLoaded(true)
    }

    React.useEffect(() => {
        if (!videoLoaded) {
            if (localParams.audioTrack) {
                setAudioTrackIndex(parseInt(localParams.audioTrack), 10)
            }
            if (localParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(localParams.subtitleTrack), 10)
            }
            if (isTranscode) {
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

    const onSelectTrack = (track) => {
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

    if (Platform.isTV) {
        const tvRemoteHandler = (remoteEvent) => {
            if (!controlsVisible && isReady) {
                if (initialSeekComplete || !initialSeekSeconds) {
                    if (remoteEvent.eventType === 'right') {
                        onProgress(progressSeconds + 90, 'manual-seek')
                    }
                    else if (remoteEvent.eventType === 'left') {
                        onProgress(progressSeconds - 5, 'manual-seek')
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
        audioDelaySeconds,
        audioTrackIndex,
        controlsVisible,
        durationSeconds,
        forceExoPlayer: forceExo,
        initialSeekComplete,
        initialSeekSeconds,
        isPlaying,
        isReady,
        isTranscode,
        logs,
        manualSeekSeconds,
        playbackFailed,
        playerKind,
        progressSeconds,
        progressPercent,
        progressDisplay,
        durationDisplay,
        seekToSeconds,
        subtitleColor,
        subtitleDelaySeconds,
        subtitleFontSize,
        subtitleTrackIndex,
        mediaTracks,
        videoHeight: clientOptions.resolutionHeight,
        videoTitle,
        videoUrl,
        videoWidth: clientOptions.resolutionWidth
    }

    const action = {
        onPlaybackComplete,
        onVideoError,
        onPauseVideo,
        onProgress,
        onProgressDebounced,
        onVideoReady,
        onReadyToSeek,
        onResumeVideo,
        onSelectTrack,
        onStopVideo,
        onVideoUpdate,
        setAudioDelaySeconds,
        setSubtitleColor,
        setSubtitleDelaySeconds,
        setSubtitleFontSize
    }

    const playerContext = {
        info,
        action,
        VideoView
    }

    console.log({ info })

    return (
        <PlayerContext.Provider
            value={playerContext}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export default PlayerContextProvider