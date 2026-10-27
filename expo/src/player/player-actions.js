import React from 'react'
import Snow from '@snowsuite/expo-snowui'
import util from '../util'
import { config } from '../settings'
import { useAppContext } from '../app-context'
import { initialPlayerHubState, resolvePlaybackConfig } from './player-hub'

const MAX_LOGS = 300

export function usePlayerActions() {
    const {
        apiClient,
        clientOptions,
        routes
    } = useAppContext()

    const {
        navPush,
        navPop,
        navReset,
        clearModals,
        closeOverlay,
        currentRoute,
        getHubState,
        sendHubData,
        resetHub
    } = Snow.useSnowContext()

    const routeParams = currentRoute?.routeParams || {}
    const handlersRef = React.useRef({})
    const logsRef = React.useRef([])
    const activeSessionRef = React.useRef(0)
    const playbackSettledRef = React.useRef(false)
    const targetSeekRef = React.useRef(0)

    const setHandlers = (nextHandlers) => {
        handlersRef.current = { ...handlersRef.current, ...nextHandlers }
    }

    const hasHandlers = () => {
        return !!(handlersRef.current.loadVideo || handlersRef.current.loadTranscode)
    }

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

    const appendStatus = (message) => {
        const current = getHubState()
        const nextMessages = [...(current.statusMessages || []), message]
        sendHubData({ statusMessages: nextMessages }, 'player.statusAppended')
    }

    const onCriticalError = (error, sessionId) => {
        if (sessionId !== undefined && sessionId !== activeSessionRef.current) {
            return
        }

        playbackSettledRef.current = false
        const currentState = getHubState()

        if (!currentState.isTranscode && navPush) {
            const nextParams = { ...routeParams, transcode: true }
            const nextMessages = [...(currentState.statusMessages || []), 'Direct play failed, switching to transcode...']
            sendHubData({
                videoLoaded: false,
                videoLoading: false,
                videoUrl: null,
                isTranscode: true,
                statusMessages: nextMessages
            }, 'player.fallbackTranscode')
            navPush({ params: nextParams, func: false })
            return
        }

        sendHubData({
            playbackFailed: error,
            videoLoading: false,
            playbackSettled: false
        }, 'player.failed')
    }

    const parseVideoPayload = async (response, sessionId) => {
        if (sessionId !== activeSessionRef.current) {
            return
        }

        addLog({
            kind: 'snowstream',
            message: 'video loaded',
            parseVideoPayload: response
        })

        if (response.error) {
            return onCriticalError(response.error, sessionId)
        }

        const currentState = getHubState()
        let targetUrl = response.url

        if (targetUrl) {
            const exists = await util.urlExists(targetUrl, currentState.isTranscode)
            if (sessionId !== activeSessionRef.current) {
                return
            }
            if (!exists) {
                targetUrl = targetUrl.replace(
                    /^([^:]+:\/\/[^/]+)(\/.*)?$/,
                    (full, base, rest) =>
                        base + (rest ? '/' + rest.slice(1).split('/').map(encodeURIComponent).join('/') : '')
                )
            }
        }

        const nextMessages = [...(currentState.statusMessages || []), 'Stream info loaded']
        if (currentState.seekToSeconds > 0) {
            nextMessages.push(`Resuming from ${util.secondsToTimestamp(currentState.seekToSeconds)}`)
        }

        const patch = {
            videoUrl: targetUrl,
            videoLoaded: true,
            videoLoading: false,
            isPlaying: currentState.playerKind !== 'web',
            videoTitle: response.name || '',
            durationSeconds: response.durationSeconds || 0,
            mediaTracks: response.tracks || null,
            playbackPlan: response.plan || {},
            mpvDecodingMode: response.mpvDecodingMode || null,
            audioTrackIndex: response.audio_index ?? currentState.audioTrackIndex,
            subtitleTrackIndex: response.subtitle_index ?? currentState.subtitleTrackIndex,
            statusMessages: nextMessages
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
        activeSessionRef.current += 1
        const currentSession = activeSessionRef.current

        const playbackConfig = resolvePlaybackConfig(routeParams, clientOptions)
        const isTranscode = playbackConfig.isTranscode
        const playerKind = playbackConfig.playerKind
        const initialSeekSeconds = playbackConfig.seekToSeconds || 0

        targetSeekRef.current = initialSeekSeconds
        playbackSettledRef.current = false

        const loadHandler = isTranscode
            ? handlersRef.current.loadTranscode
            : handlersRef.current.loadVideo

        if (!apiClient || !loadHandler) {
            return
        }

        addLog({ kind: 'snowstream', 'message': "loadVideo route params", routeParams })

        const initialStatus = isTranscode
            ? 'Requesting transcode stream'
            : 'Requesting direct stream'

        sendHubData({
            ...initialPlayerHubState,
            ...playbackConfig,
            sessionId: currentSession,
            progressSeconds: initialSeekSeconds,
            videoLoading: true,
            playbackSettled: false,
            statusMessages: [...(initialPlayerHubState.statusMessages || []), initialStatus]
        }, 'player.loading')

        const args = isTranscode
            ? [apiClient, routeParams, clientOptions?.deviceProfile, initialSeekSeconds, playerKind]
            : [apiClient, routeParams, clientOptions?.deviceProfile, playerKind]

        loadHandler(...args)
            .then((response) => parseVideoPayload(response, currentSession))
            .catch((error) => onCriticalError(error, currentSession))
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
        const currentSession = activeSessionRef.current
        const seekTarget = currentState.manualSeekSeconds || 0

        targetSeekRef.current = seekTarget
        playbackSettledRef.current = false

        addLog({ kind: 'snowstream', message: `transcode triggered seek to ${seekTarget}s` })

        sendHubData({
            videoLoaded: false,
            videoLoading: true,
            videoUrl: null,
            transcodeOnResume: false,
            seekToSeconds: seekTarget,
            playbackSettled: false,
            statusMessages: [...(currentState.statusMessages || []), `Seeking transcode to ${util.secondsToTimestamp(seekTarget)}`]
        }, 'player.transcodeSeeking')

        if (handlersRef.current.loadTranscode && apiClient) {
            handlersRef.current.loadTranscode(
                apiClient,
                routeParams,
                clientOptions?.deviceProfile,
                seekTarget,
                currentState.playerKind
            ).then((response) => parseVideoPayload(response, currentSession))
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
            targetSeekRef.current = resolvedSeconds
            playbackSettledRef.current = true
        }

        if (source === 'player-event') {
            if (!playbackSettledRef.current) {
                if (targetSeekRef.current > 0 && resolvedSeconds < targetSeekRef.current - 3) {
                    return
                }
                playbackSettledRef.current = true
            }
        }

        const isTerminalEvent = source === 'playback-complete' || source === 'manual-seek'
        const enoughDiff = !currentState.progressSeconds ||
            Math.abs(resolvedSeconds - currentState.progressSeconds) >= config.progressMinDeltaSeconds

        if (!isTerminalEvent && !enoughDiff) {
            return
        }

        const patch = { videoLoaded: true, progressSeconds: resolvedSeconds }

        if (source === 'manual-seek') {
            patch.manualSeekSeconds = resolvedSeconds
            patch.completeOnResume = nextProgressPercent >= 1.0
            patch.playbackSettled = true
            patch.statusMessages = []
            if (!currentState.isTranscode) {
                patch.seekToSeconds = resolvedSeconds
            }
            if (currentState.isTranscode && handlersRef.current.loadTranscode) {
                patch.transcodeOnResume = true
            }
        }

        if (playbackSettledRef.current && currentState.durationSeconds > 0 && resolvedSeconds > 0 && handlersRef.current.updateProgress && apiClient) {
            const currentSession = activeSessionRef.current
            const isWatched = await handlersRef.current.updateProgress(
                apiClient,
                routeParams,
                resolvedSeconds,
                currentState.durationSeconds
            )

            if (currentSession === activeSessionRef.current) {
                if (isWatched && !currentState.countedWatch && handlersRef.current.increaseWatchCount) {
                    patch.countedWatch = true
                    await handlersRef.current.increaseWatchCount(apiClient, routeParams)
                }
            }
        }

        sendHubData(patch, 'player.progressUpdated')
    }

    const onPlaybackComplete = async () => {
        const currentState = getHubState()

        if (currentState.playbackFailed || !playbackSettledRef.current) {
            return
        }

        if (currentState.durationSeconds > 0) {
            const currentProgress = currentState.progressSeconds || 0
            const completionThreshold = currentState.durationSeconds * 0.85
            if (currentProgress < completionThreshold) {
                return
            }
        }

        const finalDuration = currentState.durationSeconds || currentState.progressSeconds || 0
        await onProgress(finalDuration, 'playback-complete', 1.0)

        if (handlersRef.current.onComplete && apiClient) {
            return handlersRef.current.onComplete(apiClient, routes, navPush)
        }

        if (navPop) {
            await navPop()
            handlersRef.current = {}
            resetPlayer()
        }
    }

    const onStopVideo = async (goHome = false) => {
        const currentState = getHubState()
        activeSessionRef.current += 1

        const shouldSyncProgress = playbackSettledRef.current &&
            !currentState.playbackFailed &&
            currentState.progressSeconds &&
            handlersRef.current.updateProgress &&
            apiClient

        if (currentState.transcodeId && apiClient) {
            apiClient.closeTranscodeSession(currentState.transcodeId)
        }

        if (shouldSyncProgress) {
            await handlersRef.current.updateProgress(
                apiClient,
                routeParams,
                currentState.progressSeconds,
                currentState.durationSeconds || 0
            )
        }

        playbackSettledRef.current = false
        sendHubData({ controlsVisible: false, isPlaying: false }, 'player.stopped')
        clearModals?.()
        closeOverlay?.()

        const customStopHandler = handlersRef.current.onStopVideo
        handlersRef.current = {}
        resetPlayer()

        if (customStopHandler && apiClient) {
            return customStopHandler(apiClient, routes, navPush, navPop, goHome)
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
        const currentState = getHubState()
        const readyStatus = currentState.seekToSeconds > 0
            ? `Seeking to ${util.secondsToTimestamp(currentState.seekToSeconds)}`
            : 'Buffering frames'
        const nextMessages = [...(currentState.statusMessages || []), 'Player engine ready', readyStatus]
        sendHubData({ isVideoViewReady: true, isPlaying: true, statusMessages: nextMessages }, 'player.viewReady')
    }

    const onVideoUpdate = (eventInfo) => {
        const current = getHubState()
        if (!current.videoUrl || (!current.videoLoading && !current.isPlaying && !current.isVideoViewReady)) {
            return
        }

        if ((eventInfo?.kind === 'exoevent' || eventInfo?.kind === 'mpvevent') && eventInfo?.data) {
            if (eventInfo?.data?.data?.currentTime !== undefined) {
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
        addLog(error)
        const errorCode = error?.error?.code || error?.error?.errorCode
        if ([4, '4', 24001, '24001', 24003, '24003'].includes(errorCode)) {
            onCriticalError(error, activeSessionRef.current)
        }
    }

    const resetPlayer = (overrides = {}) => {
        activeSessionRef.current += 1
        playbackSettledRef.current = false
        targetSeekRef.current = 0
        const nextState = typeof overrides === 'function'
            ? overrides(initialPlayerHubState)
            : { ...initialPlayerHubState, ...overrides }
        resetHub(nextState)
    }

    const onFirstFrameRendered = () => {
        playbackSettledRef.current = true
        sendHubData({
            playbackSettled: true,
            statusMessages: []
        }, 'player.frameRendered')
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
        onFirstFrameRendered,
        onVideoUpdate,
        onVideoError,
        savePlaybackLogs,
        addLog,
        parseVideoPayload,
        resetPlayer
    }
}