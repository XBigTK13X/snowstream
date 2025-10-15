import React from 'react'
import { Platform } from 'react-native'
import Snow from 'expo-snowui'
import { Player } from 'snowstream'
import Video from 'react-native-video';
import { ViewType } from 'react-native-video'



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
    const { getWindowWidth, getWindowHeight } = Snow.useSnowContext(props)
    const player = Player.useSnapshot(Player.state)
    const videoRef = React.useRef(null);
    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)

    const styles = {
        wrapper: {
            width: getWindowWidth(),
            height: getWindowHeight(),
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
    let userClickedPlay = () => { }
    if (isWeb) {
        userClickedPlay = () => {
            Player.action.onVideoReady()
            setUserPlayed(true)
        }
    }

    const onError = (err) => {
        err.kind = 'rnv'
        Player.action.onVideoError(err)
    }

    React.useEffect(() => {
        if (!isWeb && !player.isReady) {
            Player.action.onVideoReady()
        }
        if (isWeb && !requestTranscode) {
            if (!player.isTranscode && (player.audioTrackIndex > 0 || player.subtitleTrackIndex > 0)) {
                setRequestTranscode(true)
                onError({ message: 'web video player cannot select tracks', error: { code: 4 } })
            }
        }
    })

    React.useEffect(() => {
        if (player.seekToSeconds > -1 && videoRef && videoRef.current) {
            videoRef.current.seek(player.seekToSeconds)
        }
    }, [player.seekToSeconds])

    if (isWeb) {
        if (!userPlayed) {
            return (
                <Snow.TextButton title="Web requires this button be pressed" onPress={userClickedPlay} />
            )
        }
        if (!player.isTranscode && (player.audioTrackIndex > 0 || player.subtitleTrackIndex > 0)) {
            return <Snow.Text>Waiting on transcode...</Snow.Text>
        }
        if (requestTranscode && !player.isTranscode) {
            return <Snow.Text>Waiting on transcode...</Snow.Text>
        }
    }

    const onRnvEvent = (kind) => {
        return (payload) => {
            Player.action.onVideoUpdate({
                kind: 'rnvevent',
                data: {
                    event: kind,
                    data: payload
                }
            })
        }
    }

    const shade = player.subtitleColor.shade * 255
    return (

        <Video
            style={styles.video}
            source={{
                uri: player.videoUrl,
                bufferConfig: bufferConfig
            }}
            ref={videoRef}
            controls={false}
            useNativeControls={false}
            // SURFACE allows HDR video playback without tonemapping on Android/TV
            viewType={ViewType.SURFACE}
            fullscreen={false}
            resizeMode="contain"
            paused={!player.isPlaying}
            playWhenInactive={false}
            playInBackground={false}
            muted={!player.isPlaying}
            selectedAudioTrack={{ type: 'index', value: player.audioTrackIndex }}
            selectedTextTrack={{ type: 'index', value: player.audioTrackIndex }}
            subtitleStyle={{
                fontSize: player.subtitleFontSize * .6,
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
    )
}
