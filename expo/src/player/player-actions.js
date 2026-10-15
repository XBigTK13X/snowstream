import React from 'react'
import Snow from 'expo-snowui'
import util from '../util'
import CONST from '../constant'
import { config } from '../settings'
import { playerSelectors } from './player-envelope'

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
    updateEnvelope,
    getEnvelope,
    resetEnvelope
}) {
    const routeParams = currentRoute?.routeParams || {}
    const handlersRef = React.useRef({})

    const setHandlers = (nextHandlers) => {
        handlersRef.current = { ...handlersRef.current, ...nextHandlers }
    }

    const hasHandlers = () => {
        return !!(handlersRef.current.loadVideo || handlersRef.current.loadTranscode)
    }

    const addLog = (logEvent) => {
        const envelope = getEnvelope()
        const logPlayback = clientOptions?.logPlayback || routeParams?.logPlayback
        if (!logPlayback) return

        const serialized = Snow.stringifySafe(logEvent)
        updateEnvelope((prev) => {
            const nextLogs = [...(prev.logs || []), serialized]
            if (nextLogs.length > MAX_LOGS) nextLogs.shift()
            return { logs: nextLogs }
        })
    }

    const onCriticalError = (error) => {
        const envelope = getEnvelope()
        const isTranscode = playerSelectors.isTranscode(envelope, routeParams, clientOptions)

        if (!isTranscode && navPush) {
            const nextParams = { ...routeParams, transcode: true }
            updateEnvelope({
                videoLoaded: false,
                videoLoading: false,
                forceTranscode: true
            })
            navPush({ params: nextParams, func: false })
        } else {
            updateEnvelope({ playbackFailed: error })
        }
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

        const envelope = getEnvelope()
        const isTranscode = playerSelectors.isTranscode(envelope, routeParams, clientOptions)

        let targetUrl = response.url
        if (targetUrl) {
            const exists = await util.urlExists(targetUrl, isTranscode)
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
            videoTitle: response.name || envelope.videoTitle,
            durationSeconds: response.durationSeconds || envelope.durationSeconds,
            mediaTracks: response.tracks || envelope.mediaTracks,
            playbackPlan: response.plan || envelope.playbackPlan,
            mpvDecodingMode: response.mpvDecodingMode || envelope.mpvDecodingMode,
            audioTrackIndex: response.audio_index ?? envelope.audioTrackIndex,
            subtitleTrackIndex: response.subtitle_index ?? envelope.subtitleTrackIndex,
        }

        if (response.tracks?.video) {
            patch.videoWidth = response.tracks.video[0]?.resolution_width
            patch.videoHeight = response.tracks.video[0]?.resolution_height
        }

        if (response.transcodeId) {
            if (envelope.transcodeId && apiClient) {
                apiClient.closeTranscodeSession(envelope.transcodeId)
            }
            patch.transcodeId = response.transcodeId
        }

        updateEnvelope(patch)
    }

    const loadVideo = () => {
        const envelope = getEnvelope()
        const isTranscode = playerSelectors.isTranscode(envelope, routeParams, clientOptions)
        const loadHandler = isTranscode ? handlersRef.current.loadTranscode : handlersRef.current.loadVideo

        if (!apiClient || !loadHandler || envelope.videoUrl || envelope.videoLoading) {
            return
        }

        const kind = playerSelectors.playerKind(envelope, routeParams, clientOptions)
        updateEnvelope({ videoLoading: true })

        const args = isTranscode
            ? [apiClient, routeParams, clientOptions?.deviceProfile, routeParams?.seekToSeconds ?? 0, kind]
            : [apiClient, routeParams, clientOptions?.deviceProfile, kind]

        loadHandler(...args)
            .then(parseVideoPayload)
            .catch(onCriticalError)
    }

    const onPauseVideo = () => {
        updateEnvelope({ controlsVisible: true, isPlaying: false })
    }

    const onResumeVideo = () => {
        Snow.hideSystemUi()
        const envelope = getEnvelope()
        updateEnvelope({ controlsVisible: false, isPlaying: true })

        if (envelope.completeOnResume) {
            onPlaybackComplete()
        }
        if (envelope.transcodeOnResume) {
            onTranscodeSeek()
        }
    }

    const onTranscodeSeek = () => {
        const envelope = getEnvelope()
        addLog({ kind: 'snowstream', message: `transcode triggered seek to ${envelope.manualSeekSeconds}s` })
        updateEnvelope({
            videoLoaded: false,
            videoLoading: false,
            videoUrl: null,
            transcodeOnResume: false
        })

        if (handlersRef.current.loadTranscode && apiClient) {
            const kind = playerSelectors.playerKind(envelope, routeParams, clientOptions)
            handlersRef.current.loadTranscode(
                apiClient,
                routeParams,
                clientOptions?.deviceProfile,
                envelope.manualSeekSeconds,
                kind
            ).then(parseVideoPayload)
        }
    }

    const onProgress = async (nextProgressSeconds, source, nextProgressPercent) => {
        const envelope = getEnvelope()
        const isTranscode = playerSelectors.isTranscode(envelope, routeParams, clientOptions)
        let resolvedSeconds = nextProgressSeconds

        if (source === 'manual-seek') {
            if (resolvedSeconds == null && nextProgressPercent != null && envelope.durationSeconds != null) {
                resolvedSeconds = nextProgressPercent * envelope.durationSeconds
            }
            if (resolvedSeconds < 0) resolvedSeconds = 0
            if (envelope.durationSeconds && resolvedSeconds > envelope.durationSeconds) {
                resolvedSeconds = envelope.durationSeconds
            }
        }

        const enoughDiff = !envelope.progressSeconds || Math.abs(resolvedSeconds - envelope.progressSeconds) >= config.progressMinDeltaSeconds

        const patch = { videoLoaded: true }

        if (source === 'manual-seek') {
            patch.manualSeekSeconds = resolvedSeconds
            patch.completeOnResume = nextProgressPercent >= 1.0
            if (!isTranscode) {
                patch.seekToSeconds = resolvedSeconds
            }
            if (isTranscode && handlersRef.current.loadTranscode) {
                patch.transcodeOnResume = true
            }
        }

        if (source === 'manual-seek' || enoughDiff) {
            patch.progressSeconds = resolvedSeconds
            if (envelope.durationSeconds > 0 && resolvedSeconds > 0 && handlersRef.current.updateProgress && apiClient) {
                const isWatched = await handlersRef.current.updateProgress(
                    apiClient,
                    routeParams,
                    resolvedSeconds,
                    envelope.durationSeconds
                )
                if (isWatched && !envelope.countedWatch && handlersRef.current.increaseWatchCount) {
                    patch.countedWatch = true
                    await handlersRef.current.increaseWatchCount(apiClient, routeParams)
                }
            }
        }

        updateEnvelope(patch)
    }

    const onPlaybackComplete = () => {
        const envelope = getEnvelope()
        onProgress(envelope.durationSeconds, 'playback-complete').then(() => {
            if (handlersRef.current.onComplete && apiClient) {
                return handlersRef.current.onComplete(apiClient, routes, navPush)
            } else if (navPop) {
                return navPop().then(() => resetEnvelope())
            }
        })
    }

    const onStopVideo = (goHome = false) => {
        const envelope = getEnvelope()
        if (envelope.transcodeId && apiClient) {
            apiClient.closeTranscodeSession(envelope.transcodeId)
        }

        updateEnvelope({ controlsVisible: false, isPlaying: false })
        clearModals?.()
        closeOverlay?.()

        if (handlersRef.current.onStopVideo && apiClient) {
            handlersRef.current.onStopVideo(apiClient, routes, navPush, navPop, goHome)
            return
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
        updateEnvelope({ isVideoViewReady: true, isPlaying: true })
    }

    const onVideoUpdate = (eventInfo) => {
        if (eventInfo?.kind === 'rnvevent' && eventInfo?.data) {
            if (eventInfo?.data?.data?.currentTime !== undefined) {
                const current = getEnvelope()
                if (!current.isSeekable) {
                    updateEnvelope({ isSeekable: true })
                }
                let adjustedSeconds = eventInfo.data.data.currentTime
                if (playerSelectors.isTranscode(current, routeParams, clientOptions)) {
                    adjustedSeconds += routeParams?.seekToSeconds ?? 0
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
        const code = error?.error?.code || error?.error?.errorCode
        if ([4, '4', 24001, '24001', 24003, '24003'].includes(code)) {
            onCriticalError(error)
        }
    }

    const savePlaybackLogs = () => {
        if (!apiClient) return Promise.resolve()
        const envelope = getEnvelope()
        return apiClient.savePlaybackLogs(envelope.logs || [])
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
        resetPlayer: resetEnvelope
    }
}