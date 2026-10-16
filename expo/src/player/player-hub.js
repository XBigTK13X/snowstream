import { Platform } from 'react-native'
import CONST from '../constant'

const isTruthyParam = (val) => val === true || val === 'true' || val === 1 || val === '1'

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
    seekToSeconds: 0,
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
        isTruthyParam(routeParams?.transcode) ||
        clientOptions?.alwaysTranscode
    )

    const seekToSeconds = routeParams?.seekToSeconds != null
        ? Number(routeParams.seekToSeconds)
        : 0

    const audioTrackIndex = routeParams?.audioTrack != null
        ? Number(routeParams.audioTrack)
        : 0

    const subtitleTrackIndex = routeParams?.subtitleTrack != null
        ? Number(routeParams.subtitleTrack)
        : 0

    if (Platform.OS === 'web') {
        return {
            playerKind: 'web',
            isTranscode,
            seekToSeconds,
            audioTrackIndex,
            subtitleTrackIndex
        }
    }

    const videoIsHdr = isTruthyParam(routeParams?.videoIsHdr)

    const forceExo = (
        routeParams?.forcePlayer === 'exo' ||
        (videoIsHdr && routeParams?.forcePlayer !== 'mpv') ||
        clientOptions?.alwaysUsePlayer === 'exo'
    )

    let playerKind = 'mpv'
    if (clientOptions?.alwaysUsePlayer === 'null') {
        playerKind = 'null'
    } else if (forceExo) {
        playerKind = 'exo'
    }

    return {
        playerKind,
        isTranscode,
        seekToSeconds,
        audioTrackIndex,
        subtitleTrackIndex
    }
}