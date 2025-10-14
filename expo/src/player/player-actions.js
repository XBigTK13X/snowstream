import { playerState, initialPlayerState } from './player-state'
import util from '../util'

export const playerActions = {
    setRuntimeDeps(deps) {
        playerState.apiClient = deps.apiClient
        playerState.clientOptions = deps.clientOptions
        playerState.config = deps.config
        playerState.routes = deps.routes
        playerState.addActionListener = deps.addActionListener
        playerState.removeActionListener = deps.removeActionListener
        playerState.navPush = deps.navPush
        playerState.navPop = deps.navPop
        playerState.currentRoute = deps.currentRoute
        playerState.clearModals = deps.clearModals
        playerState.disableOverlay = deps.disableOverlay
        if (playerState.progressSeconds == null) playerState.progressSeconds = playerState.isTranscode ? 0 : null
        if (!playerState.initialSeekComplete) playerState.initialSeekComplete = playerState.isTranscode
    },

    reset() {
        Object.assign(playerState, initialPlayerState)
    },

    setCurrentRoute(newRoute) {
        playerState.currentRoute = newRoute
    },

    setup(payload) {
        playerState.setupPayload = payload || {}
    },

    onPauseVideo() {
        playerState.controlsVisible = true
        playerState.isPlaying = false
    },

    onPlaybackComplete() {
        this.onProgress(playerState.durationSeconds, 'playback-complete').then(() => {
            if (playerState.setupPayload?.onComplete) {
                playerState.setupPayload.onComplete(playerState.apiClient, playerState.routes, playerState.navPush)
            } else {
                if (playerState.navPop) playerState.navPop()
            }
        })
    },

    onTranscodeSeek() {
        this.onAddLog({ kind: 'snowstream', message: `transcode triggered seek to ${playerState.manualSeekSeconds} seconds` })
        playerState.videoLoaded = false
        playerState.videoLoading = false
        playerState.videoUrl = null
        playerState.transcodeOnResume = false
        if (playerState.setupPayload?.loadTranscode) {
            playerState
                .setupPayload
                .loadTranscode(
                    playerState.apiClient,
                    playerState.currentRoute.routeParams,
                    playerState.clientOptions.deviceProfile,
                    playerState.manualSeekSeconds
                )
                .then(this.loadVideo.bind(this))
        }
    },

    onResumeVideo() {
        playerState.controlsVisible = false
        playerState.isPlaying = true
        if (playerState.completeOnResume) this.onPlaybackComplete()
        if (playerState.transcodeOnResume) this.onTranscodeSeek()
    },

    onStopVideo(goHome) {
        this.onCloseTranscodeSession()
        playerState.controlsVisible = false
        playerState.isPlaying = false
        if (playerState.changeRouteParamsRef.current) return
        if (playerState.setupPayload?.onStopVideo) {
            playerState.setupPayload.onStopVideo()
        } else {
            if (goHome) {
                playerState.clearModals()
                playerState.disableOverlay()
                if (playerState.navPush) playerState.navPush(playerState.routes.landing)
            } else {
                playerState.clearModals()
                playerState.disableOverlay()
                if (playerState.navPop) playerState.navPop()
            }
        }
    },

    onChangeRouteParams(newParams) {
        playerState.changeRouteParamsRef.current = newParams
        if (playerState.navPush) playerState.navPush(newParams)
    },

    onVideoReady() {
        this.onAddLog({ kind: 'snowstream', message: 'low level video player reports that it is ready to play' })
        playerState.isReady = true
        playerState.isPlaying = true
    },

    onAddLog(logEvent) {
        try {
            playerState.logs.push(JSON.stringify(logEvent))
            playerState.logs = playerState.logs
        } catch { }
    },

    onProgress(nextProgressSeconds, source, nextProgressPercent) {
        if (!playerState.videoLoaded) return
        if (source === 'manual-seek') {
            if (nextProgressSeconds == null && nextProgressPercent != null) {
                nextProgressSeconds = nextProgressPercent * playerState.durationSeconds
            }
            if (nextProgressSeconds < 0) nextProgressSeconds = 0
            if (playerState.durationSeconds && nextProgressSeconds > playerState.durationSeconds) {
                nextProgressSeconds = playerState.durationSeconds
            }
            playerState.completeOnResume = nextProgressPercent >= 1.0
            if (!playerState.isTranscode) playerState.seekToSeconds = nextProgressSeconds
        }

        const enoughTimeDiff =
            playerState.progressSeconds == null
                ? true
                : Math.abs(nextProgressSeconds - playerState.progressSeconds) >= playerState.config.progressMinDeltaSeconds

        if (source === 'manual-seek' || enoughTimeDiff) {
            playerState.progressSeconds = nextProgressSeconds
            if (playerState.durationSeconds > 0 && playerState.progressSeconds > 0) {
                if (playerState.setupPayload?.updateProgress) {
                    playerState
                        .setupPayload
                        .updateProgress(
                            playerState.apiClient,
                            playerState.currentRoute.routeParams,
                            nextProgressSeconds,
                            playerState.durationSeconds
                        )
                        .then((isWatched) => {
                            if (isWatched && !playerState.countedWatch) {
                                playerState.countedWatch = true
                                if (playerState.setupPayload?.increaseWatchCount) {
                                    return playerState.setupPayload.increaseWatchCount(playerState.apiClient, playerState.currentRoute.routeParams)
                                }
                            }
                        })
                }
            }
        }

        if (source === 'manual-seek' && playerState.isTranscode) {
            if (playerState.setupPayload?.loadTranscode) {
                playerState.manualSeekSeconds = nextProgressSeconds
                playerState.transcodeOnResume = true
            }
        }

        return Promise.resolve()
    },

    performInitialSeek() {
        if (!playerState.initialSeekComplete && playerState.initialSeekSeconds) {
            this.onAddLog({ kind: 'snowstream', message: 'perform initial seek' })
            playerState.seekToSeconds = playerState.initialSeekSeconds
            playerState.progressSeconds = playerState.initialSeekSeconds
            playerState.initialSeekComplete = true
        }
    },

    onVideoProgressEvent(elapsedSeconds) {
        let adjustedSeconds = elapsedSeconds
        if (playerState.isTranscode) {
            if (playerState.manualSeekSeconds == null) {
                adjustedSeconds += playerState.initialSeekSeconds
            } else {
                adjustedSeconds += playerState.manualSeekSeconds
            }
        }
        this.onProgress(adjustedSeconds, 'player-event')
    },

    onVideoUpdate(eventInfo) {
        if (playerState.config?.debugVideoPlayer) util.log({ eventInfo })

        if (!playerState.isTranscode) {
            if (playerState.playerKind === 'mpv') {
                if (eventInfo && eventInfo.libmpvLog && eventInfo.libmpvLog.text && eventInfo.libmpvLog.text.includes('Starting playback')) {
                    this.performInitialSeek()
                }
            } else if (playerState.playerKind === 'rnv') {
                if (eventInfo && eventInfo.kind === 'rnvevent' && eventInfo.data?.event === 'onReadyForDisplay') {
                    this.performInitialSeek()
                }
            }
        }

        if (eventInfo && eventInfo.kind === 'rnvevent') {
            if (eventInfo.data) {
                if (eventInfo.data.data && eventInfo.data.data.currentTime) {
                    this.onVideoProgressEvent(eventInfo.data.data.currentTime)
                } else {
                    this.onAddLog(eventInfo)
                }
                if (eventInfo.data.event === 'onEnd') this.onPlaybackComplete()
            }
        } else if (eventInfo && eventInfo.kind === 'mpvevent') {
            const mpvEvent = eventInfo.libmpvEvent
            if (mpvEvent?.property) {
                if (mpvEvent.property === 'time-pos') {
                    this.onVideoProgressEvent(mpvEvent.value)
                } else {
                    if (mpvEvent.property !== 'demuxer-cache-time' && mpvEvent.property !== 'track-list') {
                        this.onAddLog(eventInfo)
                    }
                }
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) this.onPlaybackComplete()
            }
        } else if (eventInfo && eventInfo.kind === 'nullevent') {
            const nullEvent = eventInfo.nullEvent
            if (nullEvent.progress) {
                this.onVideoProgressEvent(nullEvent.progress)
            } else {
                this.onAddLog(eventInfo)
            }
        } else {
            if (eventInfo?.libmpvLog?.text && !eventInfo.libmpvLog.text.includes('Description:')) {
                this.onAddLog(eventInfo)
            }
        }
    },

    onCriticalError(error) {
        if (!playerState.isTranscode) {
            playerState.videoLoaded = false
            if (playerState.navPush) playerState.navPush({ ...playerState.currentRoute.routeParams, transcode: true })
        } else {
            playerState.playbackFailed = error
        }
    },

    isRnvCode(error, code) {
        const rnvError = error?.error
        if (!rnvError) return false
        return (
            rnvError.code === code ||
            rnvError.code === `${code}` ||
            rnvError.errorCode === code ||
            rnvError.errorCode === `${code}`
        )
    },

    onVideoError(error) {
        if (playerState.config?.debugVideoPlayer) util.log({ error })
        this.onAddLog(error)
        if (error && error.kind === 'rnv') {
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
    },

    onCloseTranscodeSession() {
        if (playerState.transcodeId) {
            playerState.apiClient?.closeTranscodeSession(playerState.transcodeId)
        }
    },

    async loadVideo(response) {
        this.onAddLog({ kind: 'snowstream', message: 'video loaded', loadVideo: response })
        if (response.error) return this.onCriticalError(response.error)
        if (response.url) {
            const urlExists = await util.urlExists(response.url)
            if (urlExists) {
                playerState.videoUrl = response.url
            } else {
                const safeUrl = response.url.replace(
                    /^([^:]+:\/\/[^/]+)(\/.*)?$/,
                    (full, base, rest) => base + (rest ? '/' + rest.slice(1).split('/').map(encodeURIComponent).join('/') : '')
                )
                playerState.videoUrl = safeUrl
            }
        }
        if (response.name) playerState.videoTitle = response.name
        if (response.durationSeconds) playerState.durationSeconds = response.durationSeconds
        if (response.tracks) playerState.mediaTracks = response.tracks
        if (response.transcodeId) {
            this.onCloseTranscodeSession()
            playerState.transcodeId = response.transcodeId
        }
        playerState.videoLoaded = true
    },

    onSelectTrack(track) {
        if (track.kind === 'audio') {
            if (playerState.audioTrackIndex === track.audio_index) {
                playerState.audioTrackIndex = -1
            } else {
                playerState.audioTrackIndex = track.audio_index
            }
        }
        if (track.kind === 'subtitle') {
            if (playerState.subtitleTrackIndex === track.subtitle_index) {
                playerState.subtitleTrackIndex = -1
            } else {
                playerState.subtitleTrackIndex = track.subtitle_index
            }
        }
    },

    setAudioDelaySeconds(value) {
        playerState.audioDelaySeconds = value
    },

    setSubtitleColor(value) {
        playerState.subtitleColor = value
    },

    setSubtitleDelaySeconds(value) {
        playerState.subtitleDelaySeconds = value
    },

    setSubtitleFontSize(value) {
        playerState.subtitleFontSize = value
    },
}
