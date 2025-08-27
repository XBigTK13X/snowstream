import React from 'react'
import Video from 'react-native-video';
import { ViewType } from 'react-native-video'
import { Platform, View, TouchableOpacity } from 'react-native'
import Style from '../snow-style'
import SnowText from './snow-text'
import SnowTextButton from './snow-text-button'
import SnowModal from './snow-modal'
import { usePlayerContext } from '../player-context'

const isWeb = Platform.OS === 'web'

const bufferConfig = {
    minBufferMs: 5000,
    maxBufferMs: 10000,
    bufferForPlaybackMs: 2000,
    bufferForPlaybackAfterRebufferMs: 5000,
    backBufferDurationMs: 5000,
    cacheSizeMB: 0,
    live: {
        targetOffsetMs: 500,
    },
}

// https://docs.thewidlarzgroup.com/react-native-video/component/props

export default function RnvVideoView(props) {
    const player = usePlayerContext()
    const videoRef = React.useRef(null);
    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)

    const styles = {
        wrapper: {
            width: Style.window.width(),
            height: Style.window.height(),
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black' // Without this color, letterbox will be white by default
        },
        touchable: {
            width: Style.window.width(),
            height: Style.window.height(),
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black' // Without this color, letterbox will be white by default
        },
        video: {
            alignSelf: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'transparent' // Without this color, letterbox will be white by default
        }
    }


    // Workaround for web not allowing videos to autoplay
    let userClickedPlay = null
    if (isWeb) {
        userClickedPlay = () => {
            player.action.onVideoReady()
            setUserPlayed(true)
        }
    }

    const onError = (err) => {
        err.kind = 'rnv'
        player.action.onVideoError(err)
    }

    React.useEffect(() => {
        if (!isWeb && !player.info.isReady) {
            player.action.onVideoReady()
        }
        if (isWeb && !requestTranscode) {
            if (!player.info.isTranscode && (player.info.audioTrackIndex > 0 || player.info.subtitleTrackIndex > 0)) {
                setRequestTranscode(true)
                onError({ message: 'web video player cannot select tracks', error: { code: 4 } })
            }
        }
    })

    React.useEffect(() => {
        if (player.info.seekToSeconds > -1 && videoRef && videoRef.current) {
            videoRef.current.seek(player.info.seekToSeconds)
        }
    }, [player.info.seekToSeconds])

    if (isWeb) {
        if (!userPlayed) {
            return (
                <View>
                    <SnowTextButton title="Web requires this button be pressed" onPress={userClickedPlay} />
                </View>
            )
        }
        if (!player.info.isTranscode && (player.info.audioTrackIndex > 0 || player.info.subtitleTrackIndex > 0)) {
            return <View><SnowText>Waiting on transcode...</SnowText></View>
        }
        if (requestTranscode && !player.info.isTranscode) {
            return <View><SnowText>Waiting on transcode...</SnowText></View>
        }
    }

    const onRnvEvent = (kind) => {
        return (payload) => {
            player.action.onVideoUpdate({
                kind: 'rnvevent',
                data: {
                    event: kind,
                    data: payload
                }
            })
        }
    }

    const shade = player.info.subtitleColor.shade * 255

    return (
        <SnowModal
            wrapper={false}
            onRequestClose={() => { player.action.onStopVideo() }}
            style={styles.wrapper}>
            <TouchableOpacity
                // Without this, the video has a white film over it
                activeOpacity={1}
                hasTVPreferredFocus={!player.info.controlsVisible}
                style={styles.touchable}
                onPress={player.action.onPauseVideo}>
                <Video
                    style={styles.video}
                    source={{
                        uri: player.info.videoUrl,
                        bufferConfig: bufferConfig
                    }}
                    ref={videoRef}
                    controls={false}
                    useNativeControls={false}
                    // SURFACE allows HDR video playback without tonemapping on Android/TV
                    viewType={ViewType.SURFACE}
                    fullscreen={false}
                    focusable={true}
                    resizeMode="contain"
                    paused={!player.info.isPlaying}
                    playWhenInactive={false}
                    playInBackground={false}
                    muted={!player.info.isPlaying}
                    selectedAudioTrack={{ type: 'index', value: player.info.audioTrackIndex }}
                    selectedTextTrack={{ type: 'index', value: player.info.audioTrackIndex }}
                    subtitleStyle={{
                        fontSize: player.info.subtitleFontSize * .6,
                        color: `rgba(${shade}, ${shade}, ${shade}})`,
                        textShadowColor: 'rgba(0, 0, 0)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 5,
                        opacity: 0.9
                    }}

                    // The main events needed by snowstream
                    onError={onError}
                    onEnd={onRnvEvent('onEnd')}
                    onProgress={onRnvEvent('onProgress')}
                    onReadyForDisplay={onRnvEvent('onReadyForDisplay')}

                    // Events used primarily for debugging
                    onAudioBecomingNoisy={onRnvEvent('onAudioBecomingNoisy')}
                    onAudioFocusChanged={onRnvEvent('onAudioFocusChanged')}
                    onAudioTracks={onRnvEvent('onAudioTracks')}
                    onBandwidthUpdate={onRnvEvent('onBandwidthUpdate')}
                    onBuffer={onRnvEvent('onBuffer')}
                    onControlsVisibilityChange={onRnvEvent('onControlsVisibilityChange')}
                    onExternalPlaybackChange={onRnvEvent('onExternalPlaybackChange')}
                    onFullscreenPlayerWillPresent={onRnvEvent('onFullscreenPlayerWillPresent')}
                    onFullscreenPlayerDidPresent={onRnvEvent('onFullscreenPlayerDidPresent')}
                    onFullscreenPlayerWillDismiss={onRnvEvent('onFullscreenPlayerWillDismiss')}
                    onFullscreenPlayerDidDismiss={onRnvEvent('onFullscreenPlayerDidDismiss')}
                    onLoad={onRnvEvent('onLoad')}
                    onLoadStart={onRnvEvent('onLoadStart')}
                    onPlaybackStateChanged={onRnvEvent('onPlaybackStateChanged')}
                    onPictureInPictureStatusChanged={onRnvEvent('onPictureInPictureStatusChanged')}
                    onPlaybackRateChange={onRnvEvent('onPlaybackRateChange')}
                    onReceiveAdEvent={onRnvEvent('onReceiveAdEvent')}
                    onRestoreUserInterfaceForPictureInPictureStop={onRnvEvent('onRestoreUserInterfaceForPictureInPictureStop')}
                    onSeek={onRnvEvent('onSeek')}
                    onTimedMetadata={onRnvEvent('onTimedMetadata')}
                    onTextTrackDataChanged={onRnvEvent('onTextTrackDataChanged')}
                    onTextTracks={onRnvEvent('onTextTracks')}
                    onVideoTracks={onRnvEvent('onVideoTracks')}
                    onVolumeChange={onRnvEvent('onVolumeChange')}

                />
            </TouchableOpacity>
        </SnowModal>
    )
}
