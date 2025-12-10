import Snow from 'expo-snowui'
import _ from 'lodash'
import { playerState, initialPlayerState } from './player-state'
import util from '../util'
import CONST from '../constant'

class PlayerActions {
    constructor() {
        this.apiClient = null
        this.navPush = null
        this.navPop = null
        this.clearModals = null
        this.closeOverlay = null
        this.loadVideoHandler = null
        this.loadTranscodeHandler = null
        this.onCompleteHandler = null
        this.onStopVideoHandler = null
        this.updateProgressHandler = null
        this.increaseWatchCountHandler = null
    }

    importContexts = (deps) => {
        if (!_.isEqual(this.apiClient?.authToken, deps.apiClient?.authToken)) {
            this.apiClient = deps.apiClient
            playerState.apiClient = deps.apiClient
            playerState.hasApiClient = !!deps.apiClient
        }
        if (!_.isEqual(playerState.clientOptions, deps.clientOptions)) {
            playerState.clientOptions = deps.clientOptions
            playerState.hasClientOptions = !!deps.clientOptions
        }
        if (!_.isEqual(playerState.config, deps.config)) {
            playerState.config = deps.config
            playerState.hasConfig = !!deps.config
        }
        if (!_.isEqual(playerState.routes, deps.routes)) {
            playerState.routes = deps.routes
            playerState.hasRoutes = !!deps.routes
        }
        if (playerState.routePath !== deps.currentRoute.routePath) {
            playerState.routePath = deps.currentRoute.routePath
            playerState.hasRoutePath = !!deps.currentRoute.routePath
        }
        if (!_.isEqual(deps.currentRoute.routeParams, playerState.routeParams)) {
            playerState.routeParams = deps.currentRoute.routeParams
            playerState.hasRouteParams = !!deps.currentRoute.routeParams
        }
        if (!_.isEqual(this.navPush, deps.navPush)) {
            this.navPush = deps.navPush
            playerState.navPush = deps.navPush
            playerState.hasNavPush = !!deps.navPush
        }
        if (!_.isEqual(this.navPop, deps.navPop)) {
            this.navPop = deps.navPop
            playerState.navPop = deps.navPop
            playerState.hasNavPop = !!deps.navPop
        }
        if (!_.isEqual(this.clearModals, deps.clearModals)) {
            this.clearModals = deps.clearModals
            playerState.clearModals = deps.clearModals
            playerState.hasClearModals = !!deps.clearModals
        }
        if (!_.isEqual(this.closeOverlay, deps.closeOverlay)) {
            this.closeOverlay = deps.closeOverlay
            playerState.closeOverlay = deps.closeOverlay
            playerState.hasCloseOverlay = !!deps.closeOverlay
        }

        if (!playerState.isTranscode && deps?.currentRoute?.routeParams?.seekToSeconds !== undefined && !playerState.manualSeekSeconds) {
            playerState.seekToSeconds = deps.currentRoute.routeParams.seekToSeconds
            playerState.progressSeconds = deps.currentRoute.routeParams.seekToSeconds
        }
    }

    reset = () => {
        return new Promise(resolve => {
            Object.assign(playerState, initialPlayerState)
            playerState.logs = []
            playerState.routeParams = {}
            playerState.subtitleColor = { shade: 1.0, alpha: 1.0 }
            this.apiClient = playerState.apiClient
            this.navPush = playerState.navPush
            this.navPop = playerState.navPop
            this.routeParams = playerState.routeParams
            this.routePath = playerState.routePath
            this.clientOptions = playerState.clientOptions
            this.config = playerState.config
            this.clearModals = playerState.clearModals
            this.closeOverlay = playerState.closeOverlay
            this.loadVideoHandler = null
            this.loadTranscodeHandler = null
            this.onCompleteHandler = null
            this.onStopVideoHandler = null
            this.updateProgressHandler = null
            this.increaseWatchCountHandler = null
            resolve()
        })
    }

    effectSetVideoHandlers = (props) => {
        this.loadVideoHandler = props?.loadVideo
        this.loadTranscodeHandler = props?.loadTranscode
        this.onCompleteHandler = props?.onComplete
        this.onStopVideoHandler = props?.onStopVideo
        this.updateProgressHandler = props?.updateProgress
        this.increaseWatchCountHandler = props?.increaseWatchCount
    }

    effectLoadVideo = () => {
        if (playerState.videoUrl || !playerState.settingsLoaded) {
            return
        }
        if (playerState.videoLoading || playerState.manualSeekSeconds) {
            return
        }

        if (playerState.routeParams?.audioTrack && playerState.audioTrackIndex !== playerState.routeParams?.audioTrack) {
            playerState.audioTrackIndex = parseInt(playerState.routeParams?.audioTrack, 10)
        }
        if (playerState.routeParams?.subtitleTrack && playerState.subtitleTrackIndex !== playerState.routeParams?.subtitleTrack) {
            playerState.subtitleTrackIndex = parseInt(playerState.routeParams?.subtitleTrack, 10)
        }

        const loadHandler = playerState.isTranscode ? this.loadTranscodeHandler : this.loadVideoHandler
        if (!loadHandler) {
            return
        }

        playerState.videoLoading = true
        this.onAddLog({
            kind: 'snowstream',
            message: playerState.isTranscode ? 'firing off a loadTranscode' : 'firing off a loadVideo',
            routeParams: playerState.routeParams,
        })

        const args = playerState.isTranscode
            ? [
                this.apiClient,
                playerState.routeParams,
                playerState.clientOptions.deviceProfile,
                playerState?.routeParams?.seekToSeconds ?? 0,
                playerState.playerKind
            ]
            : [
                this.apiClient,
                playerState.routeParams,
                playerState.clientOptions.deviceProfile,
                playerState.playerKind]

        loadHandler(...args)
            .then(this.parseVideoPayload)
            .catch(this.onCriticalError)
    }

    onPauseVideo = () => {
        playerState.controlsVisible = true
        playerState.isPlaying = false
    }

    setVideoLogsVisible = (value) => {
        playerState.logsVisible = value
    }

    savePlaybackLogs = () => {
        return this.apiClient.savePlaybackLogs(playerState.logs)
    }

    onTranscodeSeek = () => {
        this.onAddLog({ kind: 'snowstream', message: `transcode triggered seek to ${playerState.manualSeekSeconds} seconds` })
        playerState.videoLoaded = false
        playerState.videoLoading = false
        playerState.videoUrl = null
        playerState.transcodeOnResume = false
        if (this.loadTranscodeHandler) {
            this.loadTranscodeHandler(
                this.apiClient,
                playerState.routeParams,
                playerState.clientOptions.deviceProfile,
                playerState.manualSeekSeconds,
                playerState.playerKind
            ).then(this.parseVideoPayload)
        }
    }

    onResumeVideo = () => {
        Snow.hideSystemUi()
        playerState.controlsVisible = false
        playerState.isPlaying = true

        if (playerState.completeOnResume) {
            this.onPlaybackComplete()
        }
        if (playerState.transcodeOnResume) {
            this.onTranscodeSeek()
        }
    }

    onVideoModalBack = () => {
        if (playerState.controlsVisible) return
        this.onStopVideo()
    }

    onPlaybackComplete = () => {
        this.onProgress(playerState.durationSeconds, 'playback-complete')
            .then(() => {
                if (this.onCompleteHandler) {
                    return this.onCompleteHandler(this.apiClient, playerState.routes, this.navPush)
                } else if (this.navPop) {
                    return this.navPop()
                }
            })
            .then(() => {
                this.reset()
            })

    }

    onStopVideo = (goHome) => {
        this.onCloseTranscodeSession()
        playerState.controlsVisible = false
        playerState.isPlaying = false
        this.clearModals?.()
        this.closeOverlay?.()



        if (goHome && this.navPush) {
            this.navPush({ path: playerState.routes.landing, func: false })
            this.reset()
            return
        }

        if (this.onStopVideoHandler) {
            this.onStopVideoHandler(this.apiClient, playerState.routes, this.navPush)
            this.reset()
        } else {
            if (this.navPop) {
                this.navPop()
                this.reset()
            }
        }
    }

    onVideoReady = () => {
        this.onAddLog({ kind: 'snowstream', message: 'low level video player reports that it is ready to play' })
        playerState.isVideoViewReady = true
        playerState.isPlaying = true
    }

    onAddLog = (logEvent) => {
        playerState.logs.push(Snow.stringifySafe(logEvent))
    }

    onProgress = async (nextProgressSeconds, source, nextProgressPercent) => {
        playerState.videoLoaded = true

        if (source === 'manual-seek') {
            if (nextProgressSeconds == null && nextProgressPercent != null && playerState.durationSeconds != null) {
                nextProgressSeconds = nextProgressPercent * playerState.durationSeconds
            }
            if (nextProgressSeconds < 0) nextProgressSeconds = 0
            if (playerState.durationSeconds && nextProgressSeconds > playerState.durationSeconds && playerState.durationSeconds != null) {
                nextProgressSeconds = playerState.durationSeconds
            }
            playerState.completeOnResume = nextProgressPercent >= 1.0
            if (!playerState.isTranscode) {
                playerState.seekToSeconds = nextProgressSeconds
            }
        }

        const enoughTimeDiff = !playerState.progressSeconds || Math.abs(nextProgressSeconds - playerState.progressSeconds) >= playerState.config.progressMinDeltaSeconds

        if (source !== 'manual-seek' && enoughTimeDiff) {
            Snow.hideSystemUi()
        }
        if (source === 'manual-seek' || enoughTimeDiff) {
            playerState.progressSeconds = nextProgressSeconds
            if (playerState.durationSeconds > 0 && playerState.progressSeconds > 0) {
                if (this.updateProgressHandler) {
                    const isWatched = await this.updateProgressHandler(
                        this.apiClient,
                        playerState.routeParams,
                        nextProgressSeconds,
                        playerState.durationSeconds
                    )
                    if (isWatched && !playerState.countedWatch && this.increaseWatchCountHandler) {
                        playerState.countedWatch = true
                        await this.increaseWatchCountHandler(this.apiClient, playerState.routeParams)
                    }
                }
            }
        }

        if (source === 'manual-seek') {
            playerState.manualSeekSeconds = nextProgressSeconds
            if (playerState.isTranscode && this.loadTranscodeHandler) {
                playerState.transcodeOnResume = true
            }
        }
    }

    onVideoProgressEvent = (elapsedSeconds) => {
        let adjustedSeconds = elapsedSeconds
        if (playerState.isTranscode) {
            adjustedSeconds += playerState?.routeParams?.seekToSeconds ?? 0
        }
        this.onProgress(adjustedSeconds, 'player-event')
    }

    onVideoUpdate = (eventInfo) => {
        if (playerState.config?.debugVideoPlayer) util.log({ eventInfo })

        if (eventInfo?.kind === 'rnvevent' && eventInfo?.data) {
            if (eventInfo?.data?.data?.currentTime) {
                this.onVideoProgressEvent(eventInfo.data.data.currentTime)
            } else {
                this.onAddLog(eventInfo)
            }
            if (eventInfo?.data?.event === 'onEnd') {
                this.onPlaybackComplete()
            }
        } else if (eventInfo?.kind === 'mpvevent') {
            const mpvEvent = eventInfo.libmpvEvent
            if (mpvEvent?.property) {
                if (mpvEvent.property === 'time-pos') {
                    this.onVideoProgressEvent(Math.floor(mpvEvent.value))
                }
                else if (!['demuxer-cache-time', 'track-list'].includes(mpvEvent.property)) {
                    this.onAddLog(eventInfo)
                }
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) {
                    this.onPlaybackComplete()
                }
            }
        } else if (eventInfo?.kind === 'nullevent') {
            const nullEvent = eventInfo.nullEvent
            if (nullEvent?.progress) this.onVideoProgressEvent(nullEvent.progress)
            else this.onAddLog(eventInfo)
        } else if (eventInfo?.libmpvLog?.text && !eventInfo.libmpvLog.text.includes('Description:')) {
            this.onAddLog(eventInfo)
        }
    }

    onCriticalError = (error) => {
        if (!playerState.isTranscode && this.navPush) {
            const newParams = { ...playerState.routeParams, transcode: true }
            playerState.videoLoaded = false
            playerState.videoLoading = false
            playerState.forceTranscode = true
            playerState.routeParams = newParams
            this.navPush({ params: newParams, func: false })
        } else {
            playerState.playbackFailed = error
        }
    }

    isRnvCode = (error, code) => {
        const rnvError = error?.error
        if (!rnvError) return false
        return (
            rnvError.code === code ||
            rnvError.code === `${code}` ||
            rnvError.errorCode === code ||
            rnvError.errorCode === `${code}`
        )
    }

    onVideoError = (error) => {
        if (playerState.config?.debugVideoPlayer) util.log({ error })
        this.onAddLog(error)
        if (error?.kind === 'rnv') {
            if (this.isRnvCode(error, 4) || this.isRnvCode(error, 24001) || this.isRnvCode(error, 24003)) {
                this.onCriticalError(error)
            } else {
                util.log('Unhandled error kind')
                util.log({ error })
            }
        } else {
            util.log('Unhandled error source')
            util.log({ error })
        }
    }

    onCloseTranscodeSession = () => {
        if (playerState.transcodeId) {
            this.apiClient.closeTranscodeSession(playerState.transcodeId)
        }
    }

    parseVideoPayload = async (response) => {
        this.onAddLog({
            kind: 'snowstream',
            message: 'video loaded',
            parseVideoPayload: response
        })
        if (response.error) {
            return this.onCriticalError(response.error)
        }

        if (response.url) {
            const urlExists = await util.urlExists(response.url)
            playerState.videoUrl = urlExists
                ? response.url
                : response.url.replace(
                    /^([^:]+:\/\/[^/]+)(\/.*)?$/,
                    (full, base, rest) =>
                        base + (rest ? '/' + rest.slice(1).split('/').map(encodeURIComponent).join('/') : '')
                )
        }
        if (response.name) {
            playerState.videoTitle = response.name
        }
        if (response.durationSeconds) {
            playerState.durationSeconds = response.durationSeconds
        }
        if (response.tracks) {
            playerState.mediaTracks = response.tracks
            if (response?.tracks?.video) {
                playerState.videoWidth = response?.tracks?.video[0]?.resolution_width
                playerState.videoHeight = response?.tracks?.video[0]?.resolution_height
            } else {
                playerState.videoWidth = CONST.resolution.fullHd.width
                playerState.videoHeight = CONST.resolution.fullHd.height
            }
        }

        if (response.transcodeId) {
            this.onCloseTranscodeSession()
            playerState.transcodeId = response.transcodeId
        }
        if (response.audio_index) {
            playerState.audioTrackIndex = response.audio_index
        }
        if (response.subtitle_index) {
            playerState.subtitleTrackIndex = response.subtitle_index
        }

        if (response.plan) {
            playerState.playbackPlan = response.plan
        }
        playerState.videoLoaded = true
    }

    onSelectTrack = (track) => {
        if (track.kind === 'audio') {
            playerState.audioTrackIndex = playerState.audioTrackIndex === track.audio_index ? -1 : track.audio_index
        } else if (track.kind === 'subtitle') {
            playerState.subtitleTrackIndex = playerState.subtitleTrackIndex === track.subtitle_index ? -1 : track.subtitle_index
        }
    }

    setAudioDelaySeconds = (value) => {
        playerState.audioDelaySeconds = value
    }

    setSubtitleDelaySeconds = (value) => {
        playerState.subtitleDelaySeconds = value
    }

    changeSubtitleColor = (direction) => {
        const newColor = { ...playerState.subtitleColor }
        newColor.shade += direction * 0.15
        newColor.shade = Math.min(1.0, Math.max(0.0, newColor.shade))
        playerState.subtitleColor = newColor
    }

    changeSubtitleFontScale = (direction) => {
        playerState.subtitleFontScale += direction * 0.1
    }

    // This was used from the player controls before the valtio rewrite
    // It stopped working and I shut it off to fix later
    toggleTranscode = () => {
        playerState.videoLoaded = false
        playerState.videoLoading = false
        playerState.isVideoViewReady = false
        playerState.controlsVisible = false
        playerState.isPlaying = false
        playerState.routeParams.transcode = playerState.playerKind === 'mpv'
        this.navPush?.({ params: playerState.routeParams, func: false })
    }

    // This was used from the player controls before the valtio rewrite
    // It stopped working and I shut it off to fix later
    togglePlayerKind = () => {
        playerState.videoLoaded = false
        playerState.videoLoading = false
        playerState.isVideoViewReady = false
        playerState.controlsVisible = false
        playerState.isPlaying = false
        if (playerState.playerKind === 'mpv') {
            playerState.playerKind = 'rnv'
            playerState.routeParams.forcePlayer = 'rnv'
        } else {
            playerState.playerKind = 'mpv'
            playerState.routeParams.forcePlayer = 'mpv'
        }
        this.navPush?.({ params: playerState.routeParams, func: false })
    }
}

export const playerActions = new PlayerActions()
export default playerActions
