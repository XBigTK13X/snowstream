import { Platform } from 'react-native'
import CONST from '../constant'

export const initialPlayerHubState = {
    videoUrl: null,
    videoTitle: null,
    videoLoading: false,
    videoLoaded: false,
    videoWidth: CONST.resolution.fullHd.width,
    videoHeight: CONST.resolution.fullHd.height,

    playerKind: Platform.OS === 'web' ? 'web' : 'mpv',
    isTranscode: false,
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

    logs: []
}

export function resolvePlaybackConfig(routeParams = {}, clientOptions = {}) {
    const isTranscode = !!(
        routeParams?.transcode === 'true' ||
        routeParams?.transcode === true ||
        clientOptions?.alwaysTranscode
    )

    if (Platform.OS === 'web') {
        return { playerKind: 'web', isTranscode }
    }

    const forceExo = (
        routeParams?.forcePlayer === 'exo' ||
        routeParams?.forcePlayer === 'rnv' ||
        (routeParams?.videoIsHdr && routeParams?.forcePlayer !== 'mpv') ||
        clientOptions?.alwaysUsePlayer === 'exo'
    )

    let playerKind = 'mpv'
    if (clientOptions?.alwaysUsePlayer === 'null') {
        playerKind = 'null'
    } else if (forceExo) {
        playerKind = 'rnv'
    }

    return { playerKind, isTranscode }
}