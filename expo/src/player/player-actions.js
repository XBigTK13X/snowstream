import Snow from 'expo-snowui'
import util from '../util'
import CONST from '../constant'
import { config } from '../settings'
import { playerSelectors, initialPlayerEnvelope } from './player-envelope'

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
    resetEnvelope,
    handlers = {}
}) {
    const routeParams = currentRoute?.routeParams || {}

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
        const loadHandler = isTranscode ? handlers.loadTranscode : handlers.loadVideo

        if (!loadHandler || envelope.videoUrl || envelope.videoLoading) {
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

        if (handlers.loadTranscode) {
            const kind = playerSelectors.playerKind(envelope, routeParams, clientOptions)
            handlers.loadTranscode(
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
            if (isTranscode && handlers.loadTranscode) {
                patch.transcodeOnResume = true
            }
        }

        if (source === 'manual-seek' || enoughDiff) {
            patch.progressSeconds = resolvedSeconds
            if (envelope.durationSeconds > 0 && resolvedSeconds > 0 && handlers.updateProgress) {
                const isWatched = await handlers.updateProgress(
                    apiClient,
                    routeParams,
                    resolvedSeconds,
                    envelope.durationSeconds
                )
                if (isWatched && !envelope.countedWatch && handlers.increaseWatchCount) {
                    patch.countedWatch = true
                    await handlers.increaseWatchCount(apiClient, routeParams)
                }
            }
        }

        updateEnvelope(patch)
    }

    const onPlaybackComplete = () => {
        const envelope = getEnvelope()
        onProgress(envelope.durationSeconds, 'playback-complete').then(() => {
            if (handlers.onComplete) {
                return handlers.onComplete(apiClient, routes, navPush)
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

        if (handlers.onStopVideo) {
            handlers.onStopVideo(apiClient, routes, navPush, navPop, goHome)
            return
        }

        if (goHome && navReset) {
            navPop?.()
            navReset()
            return
        }

        navPop?.()
    }

    return {
        loadVideo,
        onPauseVideo,
        onResumeVideo,
        onStopVideo,
        onProgress,
        onPlaybackComplete,
        onCriticalError,
        addLog,
        parseVideoPayload,
        resetPlayer: resetEnvelope,
    }
}