import React from 'react'
import Video from 'react-native-video';
import { ViewType } from 'react-native-video'
import { Platform, View, TouchableOpacity, Modal } from 'react-native'
import { StaticStyle } from '../snow-style'
import SnowText from './snow-text'
import SnowTextButton from './snow-text-button'


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
    const styles = {
        touchable: {
            width: StaticStyle.window.width(),
            height: StaticStyle.window.height(),
            zIndex: StaticStyle.depth.video.toggle,
            elevation: StaticStyle.depth.video.toggle,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black'
        },
        wrapper: {
            width: StaticStyle.window.width(),
            height: StaticStyle.window.height(),
            zIndex: StaticStyle.depth.video.wrapper,
            elevation: StaticStyle.depth.video.wrapper,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black'
        },
        video: {
            width: StaticStyle.window.width(),
            height: StaticStyle.window.height(),
            position: 'absolute',
            alignSelf: 'center',
            backgroundColor: 'black',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: StaticStyle.depth.video.content,
            elevation: StaticStyle.depth.video.content
        },
    }
    const videoRef = React.useRef(null);
    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)
    const [seekSeconds, setSeekSeconds] = React.useState(0)

    // Workaround for web not allowing videos to autoplay
    let userClickedPlay = null
    if (isWeb) {
        userClickedPlay = () => {
            props.onReady()
            setUserPlayed(true)
        }
    }

    const onError = (err) => {
        if (props.onError) {
            err.kind = 'rnv'
            props.onError(err)
        }
    }

    React.useEffect(() => {
        if (!isWeb && !props.isReady && props.onReady) {
            props.onReady()
        }
        if (isWeb && !requestTranscode) {
            if (!props.isTranscode && (props.audioIndex !== 0 || props.subtitleIndex !== 0)) {
                setRequestTranscode(true)
                onError({ message: 'web video player cannot select tracks', error: { code: 4 } })
            }
        }
    })

    React.useEffect(() => {
        if (props.seekToSeconds !== seekSeconds) {
            if (videoRef && videoRef.current) {
                videoRef.current.seek(props.seekToSeconds)
            }
            setSeekSeconds(props.seekToSeconds)
        }
    })

    if (isWeb) {
        if (!userPlayed) {
            return (
                <View>
                    <SnowTextButton title="Web requires this button be pressed" onPress={userClickedPlay} />
                </View>
            )
        }
        if (!props.isTranscode && (props.audioIndex !== 0 || props.subtitleIndex !== 0)) {
            return <View><SnowText>Waiting on transcode...</SnowText></View>
        }
        if (requestTranscode && !props.isTranscode) {
            return <View><SnowText>Waiting on transcode...</SnowText></View>
        }
    }

    const onUpdate = (kind) => {
        return (payload) => {
            if (props.onUpdate) {
                props.onUpdate({
                    kind: 'rnvevent',
                    data: {
                        event: kind,
                        data: payload
                    }
                })
            }
        }
    }

    return (
        <Modal
            onRequestClose={props.stopVideo}
            style={styles.wrapper}>
            <TouchableOpacity
                transparent
                hasTVPreferredFocus={props.shouldFocus}
                style={styles.touchable}
                onPress={props.showControls}>
                <Video
                    style={styles.video}
                    source={{
                        uri: props.videoUrl,
                        bufferConfig: bufferConfig
                    }}
                    ref={videoRef}
                    // SURFACE allows HDR video playback without tonemapping on Android/TV
                    viewType={ViewType.SURFACE}
                    fullscreen={false}
                    hideShutterView={true}
                    focusable={true}
                    shutterColor="transparent"
                    resizeMode="contain"
                    paused={!props.isPlaying}
                    playWhenInactive={false}
                    playInBackground={false}
                    muted={!props.isPlaying}
                    selectedAudioTrack={{ type: 'index', value: props.audioIndex }}
                    selectedTextTrack={{ type: 'index', value: props.subtitleIndex }}
                    subtitleStyle={{
                        fontSize: props.subtitleFontSize * .6,
                        opacity: props.subtitleColor.shade
                    }}

                    // The main events needed by snowstream
                    onError={onError}
                    onEnd={onUpdate('onEnd')}
                    onProgress={onUpdate('onProgress')}
                    onReadyForDisplay={onUpdate('onReadyForDisplay')}

                    // Events used primarily for debugging
                    onAudioBecomingNoisy={onUpdate('onAudioBecomingNoisy')}
                    onAudioFocusChanged={onUpdate('onAudioFocusChanged')}
                    onAudioTracks={onUpdate('onAudioTracks')}
                    onBandwidthUpdate={onUpdate('onBandwidthUpdate')}
                    onBuffer={onUpdate('onBuffer')}
                    onControlsVisibilityChange={onUpdate('onControlsVisibilityChange')}
                    onExternalPlaybackChange={onUpdate('onExternalPlaybackChange')}
                    onFullscreenPlayerWillPresent={onUpdate('onFullscreenPlayerWillPresent')}
                    onFullscreenPlayerDidPresent={onUpdate('onFullscreenPlayerDidPresent')}
                    onFullscreenPlayerWillDismiss={onUpdate('onFullscreenPlayerWillDismiss')}
                    onFullscreenPlayerDidDismiss={onUpdate('onFullscreenPlayerDidDismiss')}
                    onLoad={onUpdate('onLoad')}
                    onLoadStart={onUpdate('onLoadStart')}
                    onPlaybackStateChanged={onUpdate('onPlaybackStateChanged')}
                    onPictureInPictureStatusChanged={onUpdate('onPictureInPictureStatusChanged')}
                    onPlaybackRateChange={onUpdate('onPlaybackRateChange')}
                    onReceiveAdEvent={onUpdate('onReceiveAdEvent')}
                    onRestoreUserInterfaceForPictureInPictureStop={onUpdate('onRestoreUserInterfaceForPictureInPictureStop')}
                    onSeek={onUpdate('onSeek')}
                    onTimedMetadata={onUpdate('onTimedMetadata')}
                    onTextTrackDataChanged={onUpdate('onTextTrackDataChanged')}
                    onTextTracks={onUpdate('onTextTracks')}
                    onVideoTracks={onUpdate('onVideoTracks')}
                    onVolumeChange={onUpdate('onVolumeChange')}

                />
            </TouchableOpacity>
        </Modal>
    )
}
