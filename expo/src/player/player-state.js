import { Platform } from 'react-native'
import { proxyWithComputed } from 'valtio/dist/utils.cjs.js'

import { ref } from 'valtio/vanilla'
import util from '../util'

export const initialPlayerState = {
    apiClient: null,
    clientOptions: null,
    config: null,
    routes: null,

    addActionListener: null,
    removeActionListener: null,
    navPush: null,
    navPop: null,
    currentRoute: { routeParams: {} },

    setupPayload: {},

    videoUrl: null,
    videoTitle: null,
    videoLoading: false,
    videoLoaded: false,

    isReady: false,
    isPlaying: false,
    playbackFailed: false,
    controlsVisible: false,

    completeOnResume: false,
    transcodeOnResume: false,
    transcodeId: null,

    countedWatch: false,

    initialSeekComplete: false,

    progressSeconds: null,
    durationSeconds: 0.0,
    seekToSeconds: 1,
    manualSeekSeconds: null,

    logs: [],

    mediaTracks: null,

    audioDelaySeconds: 0,
    audioTrackIndex: 0,

    subtitleColor: { shade: 1.0, alpha: 1.0 },
    subtitleDelaySeconds: 0,
    subtitleFontSize: 42,
    subtitleTrackIndex: 0,

    changeRouteParamsRef: ref({ current: null }),
    allowShortcutsRef: ref({ current: false }),
    progressSecondsRef: ref({ current: 0 }),
}


export const playerState = proxyWithComputed(
    { ...initialPlayerState },
    {
        forcePlayer: (state) => state.currentRoute?.routeParams?.forcePlayer,

        forceExo: (state) => {
            const routeParams = state.currentRoute?.routeParams
            if (state.forcePlayer === 'exo') return true
            if (routeParams?.videoIsHdr && state.forcePlayer !== 'mpv') return true
            if (state.clientOptions?.alwaysUsePlayer === 'exo') return true
            return false
        },

        isTranscode: (state) => {
            const routeParams = state.currentRoute?.routeParams
            if (routeParams?.transcode === 'true') return true
            if (state.clientOptions?.alwaysTranscode) return true
            if (state.setupPayload?.forceTranscode) return true
            return false
        },

        initialSeekSeconds: (state) => {
            const seekParam = state.currentRoute?.routeParams?.seekToSeconds
            if (!seekParam) return 0
            const parsed = Math.floor(parseFloat(seekParam, 10))
            return Number.isFinite(parsed) ? parsed : 0
        },

        progressPercent: (state) =>
            state.durationSeconds > 0 && state.progressSeconds != null
                ? state.progressSeconds / state.durationSeconds
                : null,

        progressDisplay: (state) =>
            state.durationSeconds > 0 && state.progressSeconds != null
                ? util.secondsToTimestamp(state.progressSeconds)
                : null,

        durationDisplay: (state) =>
            state.durationSeconds > 0 ? util.secondsToTimestamp(state.durationSeconds) : null,

        playerKind: (state) => {
            if (state.clientOptions?.alwaysUsePlayer === 'null') return 'null'
            if (Platform.OS === 'web' || state.forceExo) return 'rnv'
            return 'mpv'
        },

        VideoView: (state) => {
            if (state.clientOptions?.alwaysUsePlayer === 'null') {
                return require('../comp/null-video-view').default
            }
            if (state.playerKind === 'rnv') {
                return require('../comp/rnv-video-view').default
            }
            return require('../comp/mpv-video-view').default
        },

        videoHeight: (state) => state.clientOptions?.resolutionHeight,
        videoWidth: (state) => state.clientOptions?.resolutionWidth,
    }
)
