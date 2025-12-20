import { Platform } from 'react-native'

import { proxy } from 'valtio'
import util from '../util'
import CONST from '../constant'

// Remember the golden rules
// READ from snapshot
// WRITE to proxy
// FUNCTION calls from proxy

export const initialPlayerState = {
    apiClient: null,
    hasApiClient: false,
    clientOptions: null,
    hasClientOptions: false,
    config: null,
    hasConfig: false,
    routes: null,
    hasRoutes: false,
    routePath: null,
    hasRoutePath: false,
    hasRouteParams: false,
    navPush: null,
    hasNavPush: false,
    navPop: null,
    hasNavPop: false,

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
    playbackFailed: false,
    controlsVisible: false,

    completeOnResume: false,
    transcodeOnResume: false,
    transcodeId: null,

    countedWatch: false,

    progressSeconds: null,
    durationSeconds: 0.0,
    seekToSeconds: 1,
    manualSeekSeconds: null,
    logsVisible: false,

    mediaTracks: null,
    playbackPlan: {},

    audioDelaySeconds: 0,
    audioTrackIndex: 0,

    subtitleDelaySeconds: 0,
    subtitleFontScale: 1.0,
    subtitleTrackIndex: 0,
}

export const playerState = proxy({
    ...initialPlayerState,
    logs: [],
    routeParams: {},
    playbackPlan: {},
    subtitleColor: { shade: 1.0, alpha: 1.0 },

    get settingsLoaded() {
        return !!(
            this.hasApiClient &&
            this.hasClientOptions &&
            this.hasConfig &&
            this.hasRoutes &&
            this.hasNavPush &&
            this.hasNavPop &&
            this.hasRouteParams &&
            this.hasRoutePath
        )
    },

    get allowShortcuts() {
        return this.isPlaying &&
            !this.controlsVisible &&
            !this.logsVisible &&
            !this.isTranscode
    },

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
        if (this.routeParams.forcePlayer === 'exo') {
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
    }
})
