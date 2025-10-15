import Snow from 'expo-snowui'
import { snapshot } from 'valtio'
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
        playerState.routePath = deps.currentRoute.routePath
        playerState.routeParams = deps.currentRoute.routeParams
        playerState.clearModals = deps.clearModals
        playerState.closeOverlay = deps.closeOverlay
        const player = snapshot(playerState)
        if (player.progressSeconds == null) {
            playerState.progressSeconds = playerState.isTranscode ? 0 : null
        }
        if (!player.initialSeekComplete) {
            playerState.initialSeekComplete = playerState.isTranscode
        }
    },

    reset() {
        Object.assign(playerState, initialPlayerState)
    },

    onPauseVideo() {
        playerState.controlsVisible = true
        playerState.isPlaying = false
    },

    onPlaybackComplete() {
        const player = snapshot(playerState)
        this.onProgress(playerState.durationSeconds, 'playback-complete').then(() => {
            if (player.onComplete) {
                playerState.onComplete(
                    player.apiClient,
                    player.routes,
                    player.navPush
                )
            } else {
                if (player.navPop) {
                    playerState.navPop()
                }
            }
        })
    },

    onTranscodeSeek() {
        const player = snapshot(playerState)
        this.onAddLog({ kind: 'snowstream', message: `transcode triggered seek to ${player.manualSeekSeconds} seconds` })
        playerState.videoLoaded = false
        playerState.videoLoading = false
        playerState.videoUrl = null
        playerState.transcodeOnResume = false
        if (player.loadTranscode) {
            playerState.loadTranscode(
                player.apiClient,
                player.routeParams,
                player.clientOptions.deviceProfile,
                player.manualSeekSeconds
            ).then(this.loadVideo.bind(this))
        }
    },

    onResumeVideo() {
        playerState.controlsVisible = false
        playerState.isPlaying = true
        const player = snapshot(playerState)
        if (player.completeOnResume) {
            this.onPlaybackComplete()
        }
        if (player.transcodeOnResume) {
            this.onTranscodeSeek()
        }
    },

    onStopVideo(goHome) {
        this.onCloseTranscodeSession()
        playerState.controlsVisible = false
        playerState.isPlaying = false
        const player = snapshot(playerState)
        if (player.changeRouteParams) {
            return
        }
        if (playerState.onStopVideo) {
            playerState.onStopVideo()
        } else {
            if (goHome) {
                playerState.clearModals()
                playerState.closeOverlay()
                if (player.navPush) {
                    playerState.navPush(player.routes.landing)
                }
            } else {
                playerState.clearModals()
                playerState.closeOverlay()
                if (player.navPop) {
                    playerState.navPop()
                }
            }
        }
    },

    onChangeRouteParams(newParams) {
        playerState.changeRouteParams = newParams
        const player = snapshot(playerState)
        if (player.navPush) {
            playerState.navPush(newParams)
        }
    },

    onVideoReady() {
        this.onAddLog({ kind: 'snowstream', message: 'low level video player reports that it is ready to play' })
        playerState.isReady = true
        playerState.isPlaying = true
    },

    onAddLog(logEvent) {
        playerState.logs.push(Snow.stringifySafe(logEvent))
    },

    onProgress(nextProgressSeconds, source, nextProgressPercent) {
        const player = snapshot(playerState)
        if (!player.videoLoaded) return
        if (source === 'manual-seek') {
            if (nextProgressSeconds == null && nextProgressPercent != null) {
                nextProgressSeconds = nextProgressPercent * player.durationSeconds
            }
            if (nextProgressSeconds < 0) nextProgressSeconds = 0
            if (player.durationSeconds && nextProgressSeconds > player.durationSeconds) {
                nextProgressSeconds = player.durationSeconds
            }
            playerState.completeOnResume = nextProgressPercent >= 1.0
            if (!player.isTranscode) {
                playerState.seekToSeconds = nextProgressSeconds
            }
        }

        const enoughTimeDiff = !player.progressSeconds || Math.abs(nextProgressSeconds - player.progressSeconds) >= player.config.progressMinDeltaSeconds

        if (source === 'manual-seek' || enoughTimeDiff) {
            player.progressSeconds = nextProgressSeconds
            if (player.durationSeconds > 0 && player.progressSeconds > 0) {
                if (player.updateProgress) {
                    playerState
                        .updateProgress(
                            player.apiClient,
                            player.routeParams,
                            nextProgressSeconds,
                            player.durationSeconds
                        )
                        .then((isWatched) => {
                            if (isWatched && !player.countedWatch) {
                                playerState.countedWatch = true
                                if (player.increaseWatchCount) {
                                    return playerState.increaseWatchCount(
                                        player.apiClient,
                                        player.routeParams
                                    )
                                }
                            }
                        })
                }
            }
        }

        if (source === 'manual-seek' && player.isTranscode) {
            if (player.loadTranscode) {
                playerState.manualSeekSeconds = nextProgressSeconds
                playerState.transcodeOnResume = true
            }
        }

        return Promise.resolve()
    },

    performInitialSeek() {
        const player = snapshot(playerState)
        if (!player.initialSeekComplete && player.initialSeekSeconds) {
            this.onAddLog({ kind: 'snowstream', message: 'perform initial seek' })
            playerState.seekToSeconds = player.initialSeekSeconds
            playerState.progressSeconds = player.initialSeekSeconds
            playerState.initialSeekComplete = true
        }
    },

    onVideoProgressEvent(elapsedSeconds) {
        const player = snapshot(playerState0)
        let adjustedSeconds = elapsedSeconds
        if (player.isTranscode) {
            if (player.manualSeekSeconds == null) {
                adjustedSeconds += player.initialSeekSeconds
            } else {
                adjustedSeconds += player.manualSeekSeconds
            }
        }
        this.onProgress(adjustedSeconds, 'player-event')
    },

    onVideoUpdate(eventInfo) {
        const player = snapshot(playerState)
        if (player.config?.debugVideoPlayer) {
            util.log({ eventInfo })
        }

        if (!player.isTranscode) {
            if (player.playerKind === 'mpv') {
                if (eventInfo?.libmpvLog?.text?.includes('Starting playback')) {
                    this.performInitialSeek()
                }
            } else if (player.playerKind === 'rnv') {
                if (eventInfo?.kind === 'rnvevent' && eventInfo?.data?.event === 'onReadyForDisplay') {
                    this.performInitialSeek()
                }
            }
        }

        if (eventInfo?.kind === 'rnvevent') {
            if (eventInfo?.data) {
                if (eventInfo?.data?.data?.currentTime) {
                    this.onVideoProgressEvent(eventInfo.data.data.currentTime)
                } else {
                    this.onAddLog(eventInfo)
                }
                if (eventInfo?.data?.event === 'onEnd') {
                    this.onPlaybackComplete()
                }
            }
        } else if (eventInfo?.kind === 'mpvevent') {
            const mpvEvent = eventInfo.libmpvEvent
            if (mpvEvent?.property) {
                if (mpvEvent.property === 'time-pos') {
                    this.onVideoProgressEvent(mpvEvent.value)
                } else {
                    if (mpvEvent.property !== 'demuxer-cache-time' && mpvEvent.property !== 'track-list') {
                        this.onAddLog(eventInfo)
                    }
                }
                if (mpvEvent.property === 'eof-reached' && !!mpvEvent.value) {
                    this.onPlaybackComplete()
                }
            }
        } else if (eventInfo?.kind === 'nullevent') {
            const nullEvent = eventInfo.nullEvent
            if (nullEvent?.progress) {
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
        const player = snapshot(playerState)
        if (!player.isTranscode) {
            playerState.videoLoaded = false
            playerState.videoLoading = false
            if (player.navPush) {
                const newParams = {
                    ...playerState.routeParams,
                    transcode: true
                }
                playerState.navPush(newParams)
            }
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
        if (playerState.config?.debugVideoPlayer) {
            util.log({ error })
        }
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
    },

    onCloseTranscodeSession() {
        const player = snapshot(playerState)
        if (player.transcodeId) {
            playerState.apiClient?.closeTranscodeSession(playerState.transcodeId)
        }
    },

    async loadVideo(response) {
        this.onAddLog({ kind: 'snowstream', message: 'video loaded', loadVideo: response })
        if (response.error) {
            return this.onCriticalError(response.error)
        }
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
        if (response.name) {
            playerState.videoTitle = response.name
        }
        if (response.durationSeconds) {
            playerState.durationSeconds = response.durationSeconds
        }
        if (response.tracks) {
            playerState.mediaTracks = response.tracks
        }
        if (response.transcodeId) {
            this.onCloseTranscodeSession()
            playerState.transcodeId = response.transcodeId
        }
        playerState.videoLoaded = true
    },

    onSelectTrack(track) {
        const player = snapshot(playerState)
        if (track.kind === 'audio') {
            if (player.audioTrackIndex === track.audio_index) {
                playerState.audioTrackIndex = -1
            } else {
                playerState.audioTrackIndex = track.audio_index
            }
        }
        if (track.kind === 'subtitle') {
            if (player.subtitleTrackIndex === track.subtitle_index) {
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
