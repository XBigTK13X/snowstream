import React from 'react'
import Snow from 'expo-snowui'
import util from '../util'
import { config } from '../settings'
import { initialPlayerHubState, resolvePlaybackConfig } from './player-hub'

const MAX_LOGS = 300

export function usePlayerActions({
    apiClient,
    clientOptions,
    routes,
    currentRoute,
    navPush,
    navPop,
    navReset,
    clearModals,
    closeOverlay,
    sendHubData,
    getHubState,
    resetHub,
    emitHubEvent
}) {
    const routeParams = currentRoute?.routeParams || {}
    const handlersRef = React.useRef({})

    const setHandlers = (nextHandlers) => {
        handlersRef.current = { ...handlersRef.current, ...nextHandlers }
    }

    const hasHandlers = () => {
        return !!(handlersRef.current.loadVideo || handlersRef.current.loadTranscode)
    }

    const logsRef = React.useRef([])

    const addLog = (logEvent) => {
        const logPlayback = clientOptions?.logPlayback || routeParams?.logPlayback
        if (!logPlayback) {
            return
        }

        const serialized = Snow.stringifySafe(logEvent)
        logsRef.current.push(serialized)
        if (logsRef.current.length > MAX_LOGS) {
            logsRef.current.shift()
        }
        getHubState().logs = logsRef.current
    }

    const savePlaybackLogs = () => {
        if (!apiClient) {
            return Promise.resolve()
        }
        return apiClient.savePlaybackLogs(logsRef.current)
    }

    const onCriticalError = (error) => {
        const currentState = getHubState()

        if (!currentState.isTranscode && navPush) {
            const nextParams = { ...routeParams, transcode: true }
            sendHubData({
                videoLoaded: false,
                videoLoading: false,
                videoUrl: null,
                isTranscode: true
            }, 'player.fallbackTranscode')
            navPush({ params: nextParams, func: false })
            return
        }

        sendHubData({ playbackFailed: error }, 'player.failed')
    }

    const parseVideoPayload = async (response) => {
        addLog({
            kind: 'snowstream',
            message: 'video loaded',
            parseVideoPayload: response
        })

        if (response.error) {
            return onCriticalError(response.error)
        }

        const currentState = getHubState()
        let targetUrl = response.url

        if (targetUrl) {
            const exists = await util.urlExists(targetUrl, currentState.isTranscode)
            if (!exists) {
                targetUrl = targetUrl.replace(
                    /^([^:]+:\/\/[^/]+)(\/.*)?$/,
                    (full, base, rest) =>
                        base + (rest ? '/' + rest.slice(1).split('/').map(encodeURIComponent).join('/') : '')
                )
            }
        }

        const patch = {
            videoUrl: targetUrl,
            videoLoaded: true,
            videoLoading: false,
            isPlaying: currentState.playerKind !== 'web',
            videoTitle: response.name || currentState.videoTitle,
            durationSeconds: response.durationSeconds || currentState.durationSeconds,
            mediaTracks: response.tracks || currentState.mediaTracks,
            playbackPlan: response.plan || currentState.playbackPlan,
            mpvDecodingMode: response.mpvDecodingMode || currentState.mpvDecodingMode,
            audioTrackIndex: response.audio_index ?? currentState.audioTrackIndex,
            subtitleTrackIndex: response.subtitle_index ?? currentState.subtitleTrackIndex
        }

        if (response.tracks?.video) {
            patch.videoWidth = response.tracks.video[0]?.resolution_width
            patch.videoHeight = response.tracks.video[0]?.resolution_height
        }

        if (response.transcodeId) {
            if (currentState.transcodeId && apiClient) {
                apiClient.closeTranscodeSession(currentState.transcodeId)
            }
            patch.transcodeId = response.transcodeId
        }

        sendHubData(patch, 'player.videoLoaded')
    }

    const loadVideo = () => {
        const currentState = getHubState()
        if (currentState.videoUrl || currentState.videoLoading) {
            return
        }

        const playbackConfig = resolvePlaybackConfig(routeParams, clientOptions)
        const isTranscode = playbackConfig.isTranscode
        const playerKind = playbackConfig.playerKind
        const seekToSeconds = playbackConfig.seekToSeconds

        const loadHandler = isTranscode
            ? handlersRef.current.loadTranscode
            : handlersRef.current.loadVideo

        if (!apiClient || !loadHandler) {
            return
        }

        sendHubData({
            ...initialPlayerHubState,
            ...playbackConfig,
            videoLoading: true
        }, 'player.loading')

        const args = isTranscode
            ? [apiClient, routeParams, clientOptions?.deviceProfile, seekToSeconds, playerKind]
            : [apiClient, routeParams, clientOptions?.deviceProfile, playerKind]

        loadHandler(...args)
            .then(parseVideoPayload)
            .catch(onCriticalError)
    }

    const onPauseVideo = () => {
        sendHubData({ controlsVisible: true, isPlaying: false }, 'player.paused')
    }

    const onResumeVideo = () => {
        Snow.hideSystemUi()
        const currentState = getHubState()
        sendHubData({ controlsVisible: false, isPlaying: true }, 'player.resumed')

        if (currentState.completeOnResume) {
            onPlaybackComplete()
        }
        if (currentState.transcodeOnResume) {
            onTranscodeSeek()
        }
    }

    const onTranscodeSeek = () => {
        const currentState = getHubState()
        addLog({ kind: 'snowstream', message: `transcode triggered seek to ${currentState.manualSeekSeconds}s` })

        sendHubData({
            videoLoaded: false,
            videoLoading: false,
            videoUrl: null,
            transcodeOnResume: false
        }, 'player.transcodeSeeking')

        if (handlersRef.current.loadTranscode && apiClient) {
            handlersRef.current.loadTranscode(
                apiClient,
                routeParams,
                clientOptions?.deviceProfile,
                currentState.manualSeekSeconds,
                currentState.playerKind
            ).then(parseVideoPayload)
        }
    }

    const onProgress = async (nextProgressSeconds, source, nextProgressPercent) => {
        const currentState = getHubState()
        let resolvedSeconds = nextProgressSeconds

        if (source === 'manual-seek') {
            if (resolvedSeconds == null && nextProgressPercent != null && currentState.durationSeconds != null) {
                resolvedSeconds = nextProgressPercent * currentState.durationSeconds
            }
            if (resolvedSeconds < 0) {
                resolvedSeconds = 0
            }
            if (currentState.durationSeconds && resolvedSeconds > currentState.durationSeconds) {
                resolvedSeconds = currentState.durationSeconds
            }
        }

        const enoughDiff = !currentState.progressSeconds ||
            Math.abs(resolvedSeconds - currentState.progressSeconds) >= config.progressMinDeltaSeconds

        if (source !== 'manual-seek' && !enoughDiff) {
            return
        }

        const patch = { videoLoaded: true }

        if (source === 'manual-seek') {
            patch.manualSeekSeconds = resolvedSeconds
            patch.completeOnResume = nextProgressPercent >= 1.0
            if (!currentState.isTranscode) {
                patch.seekToSeconds = resolvedSeconds
            }
            if (currentState.isTranscode && handlersRef.current.loadTranscode) {
                patch.transcodeOnResume = true
            }
        }

        if (source === 'manual-seek' || enoughDiff) {
            patch.progressSeconds = resolvedSeconds
            if (currentState.durationSeconds > 0 && resolvedSeconds > 0 && handlersRef.current.updateProgress && apiClient) {
                const isWatched = await handlersRef.current.updateProgress(
                    apiClient,
                    routeParams,
                    resolvedSeconds,
                    currentState.durationSeconds
                )
                if (isWatched && !currentState.countedWatch && handlersRef.current.increaseWatchCount) {
                    patch.countedWatch = true
                    await handlersRef.current.increaseWatchCount(apiClient, routeParams)
                }
            }
        }

        sendHubData(patch, 'player.progressUpdated')
    }

    const onPlaybackComplete = () => {
        const currentState = getHubState()
        onProgress(currentState.durationSeconds, 'playback-complete').then(() => {
            if (handlersRef.current.onComplete && apiClient) {
                return handlersRef.current.onComplete(apiClient, routes, navPush)
            }
            if (navPop) {
                return navPop().then(() => {
                    handlersRef.current = {}
                    resetHub(initialPlayerHubState)
                })
            }
        })
    }

    const onStopVideo = (goHome = false) => {
        const currentState = getHubState()
        if (currentState.transcodeId && apiClient) {
            apiClient.closeTranscodeSession(currentState.transcodeId)
        }

        sendHubData({ controlsVisible: false, isPlaying: false }, 'player.stopped')
        clearModals?.()
        closeOverlay?.()

        const customStopHandler = handlersRef.current.onStopVideo
        handlersRef.current = {}

        if (customStopHandler && apiClient) {
            customStopHandler(apiClient, routes, navPush, navPop, goHome)
        }

        if (goHome && navReset) {
            navPop?.()
            navReset()
            return
        }

        navPop?.()
    }

    const onVideoReady = () => {
        addLog({ kind: 'snowstream', message: 'low level video player reports that it is ready to play' })
        sendHubData({ isVideoViewReady: true, isPlaying: true }, 'player.viewReady')
    }

    const onVideoUpdate = (eventInfo) => {
        if ((eventInfo?.kind === 'exoevent' || eventInfo?.kind === 'mpvevent') && eventInfo?.data) {
            if (eventInfo?.data?.data?.currentTime !== undefined) {
                const current = getHubState()
                if (!current.isSeekable) {
                    sendHubData({ isSeekable: true }, 'player.seekable')
                }
                let adjustedSeconds = eventInfo.data.data.currentTime
                if (current.isTranscode) {
                    adjustedSeconds += Number(routeParams?.seekToSeconds ?? 0)
                }
                onProgress(adjustedSeconds, 'player-event')
            } else {
                addLog(eventInfo)
            }
            if (eventInfo?.data?.event === 'onEnd') {
                onPlaybackComplete()
            }
        }
    }

    const onVideoError = (error) => {
        console.log({ error })
        addLog(error)
        const errorCode = error?.error?.code || error?.error?.errorCode
        if ([4, '4', 24001, '24001', 24003, '24003'].includes(errorCode)) {
            onCriticalError(error)
        }
    }

    return {
        setHandlers,
        hasHandlers,
        loadVideo,
        onPauseVideo,
        onResumeVideo,
        onStopVideo,
        onProgress,
        onPlaybackComplete,
        onCriticalError,
        onVideoReady,
        onVideoUpdate,
        onVideoError,
        savePlaybackLogs,
        addLog,
        parseVideoPayload,
        resetPlayer: () => resetHub(initialPlayerHubState)
    }
}