import { Platform } from 'react-native'
import util from '../util'
import CONST from '../constant'

export const initialPlayerEnvelope = {
    videoUrl: null,
    videoTitle: null,
    videoLoading: false,
    videoLoaded: false,
    videoWidth: CONST.resolution.fullHd.width,
    videoHeight: CONST.resolution.fullHd.height,

    mpvDecodingMode: null,
    isVideoViewReady: false,
    isPlaying: false,
    isSeekable: false,
    playbackFailed: null,
    controlsVisible: false,
    logsVisible: false,

    completeOnResume: false,
    transcodeOnResume: false,
    transcodeId: null,
    countedWatch: false,

    progressSeconds: null,
    durationSeconds: 0.0,
    seekToSeconds: 1,
    manualSeekSeconds: null,

    mediaTracks: null,
    playbackPlan: {},

    audioDelaySeconds: 0,
    audioTrackIndex: 0,

    subtitleDelaySeconds: 0,
    subtitleFontScale: 1.0,
    subtitleTrackIndex: 0,
    subtitleColor: { shade: 1.0, alpha: 1.0 },

    logs: [],
    forceTranscode: false,
}

// Pure helper selectors to replace Valtio getters
export const playerSelectors = {
    allowShortcuts: (envelope) => {
        return !!(
            envelope.isPlaying &&
            !envelope.controlsVisible &&
            !envelope.logsVisible &&
            !playerSelectors.isTranscode(envelope)
        )
    },

    forceExo: (envelope, routeParams = {}, clientOptions = {}) => {
        if (routeParams?.forcePlayer === 'exo' || routeParams?.forcePlayer === 'rnv') {
            return true
        }
        if (routeParams?.videoIsHdr && routeParams?.forcePlayer !== 'mpv') {
            return true
        }
        if (clientOptions?.alwaysUsePlayer === 'exo') {
            return true
        }
        return false
    },

    isTranscode: (envelope, routeParams = {}, clientOptions = {}) => {
        if (routeParams?.transcode === 'true' || routeParams?.transcode === true) {
            return true
        }
        if (clientOptions?.alwaysTranscode) {
            return true
        }
        return !!envelope.forceTranscode
    },

    progressPercent: (envelope) => {
        if (envelope.durationSeconds > 0 && envelope.progressSeconds != null) {
            return envelope.progressSeconds / envelope.durationSeconds
        }
        return null
    },

    progressDisplay: (envelope) => {
        if (envelope.durationSeconds > 0 && envelope.progressSeconds != null) {
            return util.secondsToTimestamp(envelope.progressSeconds)
        }
        return null
    },

    durationDisplay: (envelope) => {
        return envelope.durationSeconds > 0
            ? util.secondsToTimestamp(envelope.durationSeconds)
            : null
    },

    playerKind: (envelope, routeParams = {}, clientOptions = {}) => {
        if (clientOptions?.alwaysUsePlayer === 'null') {
            return 'null'
        }
        if (Platform.OS === 'web' || playerSelectors.forceExo(envelope, routeParams, clientOptions)) {
            return 'rnv'
        }
        if (routeParams?.forcePlayer === 'exo') {
            return 'rnv'
        }
        return 'mpv'
    },
}