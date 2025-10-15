import { Platform } from 'react-native'

import { proxy } from 'valtio'
import util from '../util'

// Remember the golden rules
// READ from snapshot
// WRITE to proxy
// FUNCTION calls from proxy

export const initialPlayerState = {
    apiClient: null,
    clientOptions: null,
    config: null,
    routes: null,

    addActionListener: null,
    removeActionListener: null,
    navPush: null,
    navPop: null,
    routeParams: {},
    routePath: null,

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

    changeRouteParams: null,
    allowShortcuts: false
}

export const playerState = proxy({
    ...initialPlayerState,

    get forceExo() {
        if (this.routeParams?.forcePlayer === 'exo') {
            return true
        }
        if (this.routeParams?.videoIsHdr && this.routeParams?.forcePlayer !== 'mpv') {
            return true
        }
        if (this.clientOptions?.alwaysUsePlayer === 'exo') {
            return true
        }
        return false
    },

    get isTranscode() {
        if (this.routeParams?.transcode === 'true' || this.routeParams?.transcode === true) {
            return true
        }
        if (this.clientOptions?.alwaysTranscode) {
            return true
        }
        if (this.forceTranscode) {
            return true
        }
        return false
    },

    get initialSeekSeconds() {
        const seekParam = this.routeParams?.seekToSeconds
        if (!seekParam) {
            return 0
        }
        const parsed = parseInt(seekParam, 10)
        return Number.isFinite(parsed) ? parsed : 0
    },

    get progressPercent() {
        if (this.durationSeconds > 0 && this.progressSeconds != null) {
            return this.progressSeconds / this.durationSeconds
        }
        return null
    },

    get progressDisplay() {
        if (this.durationSeconds > 0 && this.progressSeconds != null) {
            return util.secondsToTimestamp(this.progressSeconds)
        }
        return null
    },

    get durationDisplay() {
        return this.durationSeconds > 0
            ? util.secondsToTimestamp(this.durationSeconds)
            : null
    },

    get playerKind() {
        if (this.clientOptions?.alwaysUsePlayer === 'null') {
            return 'null'
        }
        if (Platform.OS === 'web' || this.forceExo) {
            return 'rnv'
        }
        return 'mpv'
    },

    get VideoView() {
        if (this.clientOptions?.alwaysUsePlayer === 'null') {
            return require('../comp/null-video-view').default
        }
        if (this.playerKind === 'rnv') {
            return require('../comp/rnv-video-view').default
        }
        return require('../comp/mpv-video-view').default
    },

    get videoHeight() {
        return this.clientOptions?.resolutionHeight
    },

    get videoWidth() {
        return this.clientOptions?.resolutionWidth
    },
})
