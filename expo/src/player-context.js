import React from 'react';
import { Platform } from 'react-native';
import Snow from 'expo-snowui'
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
    const {
        apiClient,
        clientOptions,
        config,
        routes
    } = useAppContext()
    const {
        setRemoteCallbacks,
        navPush,
        navPop,
        setNavigationAllowed,
        currentRoute
    } = Snow.useSnowContext()

    const [videoUrl, setVideoUrl] = React.useState(null)
    const [videoTitle, setVideoTitle] = React.useState(null)
    const [videoLoading, setVideoLoading] = React.useState(false)
    // The media info from snowstream's server has been provided to this client
    const [videoLoaded, setVideoLoaded] = React.useState(false)

    // The low level video player has fired an event indicating that playback is ready to begin
    const [isReady, setIsReady] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [playbackFailed, setPlaybackFailed] = React.useState(false)
    const [controlsVisible, setControlsVisible] = React.useState(false)
    // If a user moved the progress slider all the way to the right, then finish playing the video when they hit resume
    const [completeOnResume, setCompleteOnResume] = React.useState(false)
    // When seeking during a transcode, don't take action until resume is clicked
    const [transcodeOnResume, setTranscodeOnResume] = React.useState(false)
    const [transcodeId, setTranscodeId] = React.useState(null)

    // Prevent the end of a video stream from triggering dozens of watch count updates
    const [countedWatch, setCountedWatch] = React.useState(false)

    let isTranscode = false
    if (currentRoute.routeParams.transcode === 'true') {
        isTranscode = true
    }
    if (clientOptions.alwaysTranscode) {
        isTranscode = true
    }
    if (props.forceTranscode) {
        isTranscode = true
    }

    // The initial seek only happens when resuming an in progress video instead of playing from the beginning
    const [initialSeekComplete, setInitialSeekComplete] = React.useState(isTranscode)
    const initialSeekSeconds = currentRoute.routeParams.seekToSeconds ? Math.floor(parseFloat(currentRoute.routeParams.seekToSeconds, 10)) : 0

    // progress is the amount of seconds played in the video player
    const [progressSeconds, setProgressSeconds] = React.useState(isTranscode ? 0 : null)
    // duration is the amount of seconds in the loaded content
    const [durationSeconds, setDurationSeconds] = React.useState(0.0)
    // seek triggers a seek event on the low level video player
    const [seekToSeconds, setSeekToSeconds] = React.useState(1)
    // a transcode doesn't have the real progress/duration info for the player
    // manual serves as an offset to progress to provide the ability to seek
    const [manualSeekSeconds, setManualSeekSeconds] = React.useState(null)

    const [logs, setLogs] = React.useState([])

    const [mediaTracks, setMediaTracks] = React.useState(null)

    const [audioDelaySeconds, setAudioDelaySeconds] = React.useState(0)
    const [audioTrackIndex, setAudioTrackIndex] = React.useState(0)

    const [subtitleColor, setSubtitleColor] = React.useState({ shade: 1.0, alpha: 1.0 })
    const [subtitleDelaySeconds, setSubtitleDelaySeconds] = React.useState(0)
    const [subtitleFontSize, setSubtitleFontSize] = React.useState(42)
    const [subtitleTrackIndex, setSubtitleTrackIndex] = React.useState(0)

    const changeRouteParamsRef = React.useRef(null)

    const forcePlayer = currentRoute.routeParams.forcePlayer
    let forceExo = false
    if (forcePlayer === 'exo') {
        forceExo = true
    }
    else if (currentRoute.routeParams.videoIsHdr && forcePlayer !== 'mpv') {
        forceExo = true
    }
    else if (clientOptions.alwaysUsePlayer === 'exo') {
        forceExo = true
    }

    let progressPercent = null
    let progressDisplay = null
    let durationDisplay = null

    if (durationSeconds > 0) {
        progressPercent = progressSeconds / durationSeconds
        progressDisplay = util.secondsToTimestamp(progressSeconds)
        durationDisplay = util.secondsToTimestamp(durationSeconds)
    }

    let playerKind = null
    let VideoView = null
    if (clientOptions.alwaysUsePlayer === 'null') {
        VideoView = require('./comp/null-video-view').default
        playerKind = 'null'
    }
    else {
        if (Platform.OS === 'web' || forceExo) {
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
                props.onComplete(apiClient, routes, navPush)
            } else {
                navPop()
            }
        })
    }

    const onTranscodeSeek = () => {
        onAddLog({ kind: 'snowstream', message: `transcode triggered seek to ${manualSeekSeconds} seconds` })
        setVideoLoaded(false)
        setVideoLoading(false)
        setVideoUrl(null)
        setTranscodeOnResume(false)
        props.loadTranscode(apiClient, currentRoute.routeParams, clientOptions.deviceProfile, manualSeekSeconds)
            .then(loadVideo)
    }

    const onResumeVideo = () => {
        setControlsVisible(false)
        setIsPlaying(true)
        if (completeOnResume) {
            onPlaybackComplete()
        }
        if (transcodeOnResume) {
            onTranscodeSeek()
        }
    }

    const onStopVideo = (goHome) => {
        onCloseTranscodeSession()
        setControlsVisible(false)
        setIsPlaying(false)
        // When swapping between players or swapping to/from transcode
        // The onStopVideo will cause a navPop and kill the param change
        // This prevents that failure
        if (changeRouteParamsRef.current) {
            return
        }
        if (props.onStopVideo) {
            props.onStopVideo()
        }
        else {
            if (goHome) {
                navPush(routes.landing)
            }
            else {
                navPop()
            }
        }
    }

    const onChangeRouteParams = (newParams) => {
        changeRouteParamsRef.current = newParams
        navPush(newParams)
    }

    const onVideoReady = () => {
        onAddLog({ kind: "snowstream", message: "low level video player reports that it is ready to play" })
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

    const onProgress = (nextProgressSeconds, source, nextProgressPercent) => {
        if (!videoLoaded) {
            return
        }
        // Slider provides a percent, convert that to seconds and act accordingly
        if (source === 'manual-seek') {
            if (nextProgressSeconds === null && nextProgressPercent !== null) {
                nextProgressSeconds = nextProgressPercent * durationSeconds
            }
            if (nextProgressSeconds < 0) {
                nextProgressSeconds = 0
            }
            if (durationSeconds) {
                if (nextProgressSeconds > durationSeconds) {
                    nextProgressSeconds = durationSeconds
                }
            }
            if (nextProgressPercent >= 1.0) {
                setCompleteOnResume(true)
            } else {
                setCompleteOnResume(false)
            }
            if (!isTranscode) {
                setSeekToSeconds(nextProgressSeconds)
            }
        }

        // If the slider was moved or enough time has passed since the last video event,
        // Then update the server's tracked progress for this video
        const enoughTimeDiff = Math.abs(nextProgressSeconds - progressSeconds) >= config.progressMinDeltaSeconds
        if (source === 'manual-seek' || enoughTimeDiff) {
            setProgressSeconds(nextProgressSeconds)
            if (durationSeconds > 0 && progressSeconds > 0) {
                if (props.updateProgress) {
                    props.updateProgress(apiClient, currentRoute.routeParams, nextProgressSeconds, durationSeconds)
                        .then((isWatched) => {
                            if (isWatched && !countedWatch) {
                                setCountedWatch(true)
                                if (props.increaseWatchCount) {
                                    return props.increaseWatchCount(apiClient, currentRoute.routeParams)
                                }
                            }
                        })
                }
            }
        }

        // Transcode streams have no seek capability
        // Destroy and create a new one instead at the requested timestamp
        if (source === 'manual-seek' && isTranscode) {
            if (props.loadTranscode) {
                setManualSeekSeconds(nextProgressSeconds)
                setTranscodeOnResume(true)
            }
        }
        return new Promise((resolve) => { resolve() })
    }



    const performInitialSeek = () => {
        if (!initialSeekComplete && initialSeekSeconds) {
            onAddLog({ kind: "snowstream", message: "perform initial seek" })
            setSeekToSeconds(initialSeekSeconds)
            setProgressSeconds(initialSeekSeconds)
            setInitialSeekComplete(true)
        }
    }

    const onVideoProgressEvent = (seconds) => {
        // When this fires during a transcode, it needs to be offset by the manual seek amount
        if (isTranscode) {
            if (manualSeekSeconds == null) {
                seconds += initialSeekSeconds
            }
            else {
                seconds += manualSeekSeconds
            }
        }
        onProgress(seconds, 'player-event')
    }

    const onVideoUpdate = (info) => {
        if (config.debugVideoPlayer) {
            util.log({ info })
        }

        if (!isTranscode) {
            if (playerKind === 'mpv') {
                if (info && info.libmpvLog && info.libmpvLog.text && info.libmpvLog.text.includes('Starting playback')) {
                    performInitialSeek()
                }
            }
            else if (playerKind === 'rnv') {
                if (info && info.kind === 'rnvevent' && info.data.event === 'onReadyForDisplay') {
                    performInitialSeek()
                }
            }
        }

        if (info && info.kind && info.kind === 'rnvevent') {
            if (info.data) {
                if (info.data.data && info.data.data.currentTime) {
                    onVideoProgressEvent(info.data.data.currentTime)
                }
                else {
                    onAddLog(info)
                }
                if (info.data.event === 'onEnd') {
                    onPlaybackComplete()
                }
            }
        }
        else if (info && info.kind && info.kind === 'mpvevent') {
            let mpvEvent = info.libmpvEvent
            if (mpvEvent.property) {
                if (mpvEvent.property === 'time-pos') {
                    onVideoProgressEvent(mpvEvent.value)
                }
                else {
                    if (mpvEvent.property !== 'demuxer-cache-time' && mpvEvent.property !== 'track-list') {
                        onAddLog(info)
                    }
                }
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) {
                    onPlaybackComplete()
                }
            }
        }
        else if (info && info.kind && info.kind === 'nullevent') {
            const nullEvent = info.nullEvent
            if (nullEvent.progress) {
                onVideoProgressEvent(nullEvent.progress)
            }
            else {
                onAddLog(info)
            }
        }
        else {
            if (info.libmpvLog && info.libmpvLog.text && !info.libmpvLog.text.includes('Description:')) {
                onAddLog(info)
            }
        }
    }

    const onCriticalError = (err) => {
        if (!isTranscode) {
            setVideoLoaded(false)
            navPush({ ...currentRoute.routeParams, transcode: true })
        }
        else {
            setPlaybackFailed(err)
        }
    }

    const isRnvCode = (err, code) => {
        return err.error.code === code || err.error.code === `${code}` || err.error.errorCode === code || err.error.errorCode === `${code}`
    }

    const onVideoError = (err) => {
        if (config.debugVideoPlayer) {
            util.log({ err })
        }

        onAddLog(err)

        if (err && err.kind && err.kind === 'rnv') {
            if (isRnvCode(err, 4) || isRnvCode(err, 24001) || isRnvCode(err, 24003)) {
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

    const onCloseTranscodeSession = () => {
        if (transcodeId) {
            apiClient.closeTranscodeSession(transcodeId)
        }
    }

    // The page received a response from the server for the specific kind of video to play
    const loadVideo = async (response) => {
        onAddLog({ kind: 'snowstream', message: 'video loaded', loadVideo: response })
        if (response.error) {
            return onCriticalError(response.error)
        }
        if (response.url) {
            const urlExists = await util.urlExists(response.url)
            if (urlExists) {
                setVideoUrl(response.url)

            }
            else {
                // If the url isn't encoded, then the media server (nginx)
                // will throw a 404 on some path characters (like #)
                const safeUrl = response.url.replace(/^([^:]+:\/\/[^/]+)(\/.*)?$/, (_, base, rest) =>
                    base + (rest ? '/' + rest.slice(1).split('/').map(encodeURIComponent).join('/') : '')
                );
                setVideoUrl(safeUrl)
            }
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
        if (response.transcodeId) {
            onCloseTranscodeSession()
            setTranscodeId(response.transcodeId)
        }
        setVideoLoaded(true)
    }

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

    const playerHandleRemote = (kind, action) => {
        if (!controlsVisible && isReady && !isTranscode) {
            if (initialSeekComplete || !initialSeekSeconds) {
                if (kind === 'right') {
                    onProgress(progressSeconds + 90, 'manual-seek')
                }
                else if (kind === 'left') {
                    onProgress(progressSeconds - 5, 'manual-seek')
                }
                else if (kind === 'down') {
                    setSubtitleFontSize((fontSize) => {
                        return fontSize -= 4
                    })
                }
                else if (kind === 'up') {
                    setSubtitleColor((fontColor) => {
                        let newColor = { ...fontColor }
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

    React.useEffect(() => {
        // If manualSeekSeconds is set, then a user triggered a video load by seeking during a transcode
        if (!videoLoading && !manualSeekSeconds) {
            setVideoLoading(true)
            if (currentRoute.routeParams.audioTrack) {
                setAudioTrackIndex(parseInt(currentRoute.routeParams.audioTrack), 10)
            }
            if (currentRoute.routeParams.subtitleTrack) {
                setSubtitleTrackIndex(parseInt(currentRoute.routeParams.subtitleTrack), 10)
            }
            if (isTranscode) {
                if (props.loadTranscode) {
                    onAddLog({ kind: 'snowstream', message: 'firing off a loadTranscode', routeParams: currentRoute.routeParams })
                    props.loadTranscode(apiClient, currentRoute.routeParams, clientOptions.deviceProfile, initialSeekSeconds)
                        .then(loadVideo)
                }
            }
            else {
                if (props.loadVideo) {
                    onAddLog({ kind: 'snowstream', message: 'firing off a loadVideo', routeParams: currentRoute.routeParams })
                    props.loadVideo(apiClient, currentRoute.routeParams, clientOptions.deviceProfile)
                        .then(loadVideo)
                }
            }
        }
    }, [currentRoute, manualSeekSeconds, videoLoading, apiClient, clientOptions, initialSeekSeconds])

    React.useEffect(() => {
        setRemoteCallbacks((callbacks) => {
            callbacks['player'] = playerHandleRemote
            return callbacks
        })
        return () => {
            setRemoteCallbacks((callbacks) => {
                callbacks['player'] = null
                return callbacks
            })
        }
    }, [])

    React.useEffect(() => {
        setNavigationAllowed(false)
        return () => {
            setNavigationAllowed(true)
        }
    }, [])

    const action = {
        onChangeRouteParams,
        onCloseTranscodeSession,
        onPauseVideo,
        onPlaybackComplete,
        onProgress,
        onResumeVideo,
        onSelectTrack,
        onStopVideo,
        onVideoError,
        onVideoReady,
        onVideoUpdate,
        setAudioDelaySeconds,
        setSubtitleColor,
        setSubtitleDelaySeconds,
        setSubtitleFontSize,
    }

    const info = {
        audioDelaySeconds,
        audioTrackIndex,
        controlsVisible,
        durationSeconds,
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
        videoLoaded,
        videoUrl,
        videoWidth: clientOptions.resolutionWidth
    }

    const playerContext = {
        action,
        info,
        VideoView
    }

    return (
        <PlayerContext.Provider
            value={playerContext}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export default PlayerContextProvider