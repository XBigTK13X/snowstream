import React from 'react'
import { TouchableOpacity } from 'react-native'
import Snow, { useStyleContext } from 'react-native-snowui'
import { useAppContext } from '../app-context'
import { usePlayerContext } from '../player-context'

// https://mpv.io/manual/master/#property-manipulation
export default function MpvVideoView(props) {
    const { getWindowHeight, getWindowWidth } = useStyleContext(props)
    const { clientOptions } = useAppContext()
    const player = usePlayerContext()

    const styles = {
        touchable: {
            width: getWindowWidth(),
            height: getWindowHeight(),
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
        },
        wrapper: {
            width: getWindowWidth(),
            height: getWindowHeight(),
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center'
        }
    }

    // Don't want it being included outside of Android
    // Don't trying importing it until first render
    const Libmpv = require('expo-libmpv')

    const forwardRef = React.useRef(null);

    React.useEffect(() => {
        if (!player.info.isReady) {
            if (forwardRef.current) {
                if (clientOptions.useFastMpv) {
                    forwardRef.current.runCommand(`set|hwdec|mediacodec`)
                    forwardRef.current.runCommand(`set|vo|gpu`)
                    forwardRef.current.runCommand(`set|profile|fast`)
                    forwardRef.current.runCommand(`set|gpu-context|android`)
                    forwardRef.current.runCommand(`set|scale|bilinear`)
                    forwardRef.current.runCommand(`set|dscale|bilinear`)
                    forwardRef.current.runCommand(`set|interpolation|no`)
                    forwardRef.current.runCommand(`set|video-sync|display-resample`)
                    forwardRef.current.runCommand(`set|opengl-es|yes`)
                    forwardRef.current.runCommand(`set|audio-buffer|0.2`)
                    forwardRef.current.runCommand(`set|cache|yes`)
                }
                else {
                    if (clientOptions.audioCompression) {
                        // Loudness normalization from Snowby
                        forwardRef.current.runCommand(`set|af|acompressor=ratio=4,loudnorm`)
                    }
                }

            }
            player.action.onVideoReady()
        }
    })

    React.useEffect(() => {
        if (forwardRef.current && player.info.isReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`)
            forwardRef.current.runCommand(`set|sub-font-size|${player.info.subtitleFontSize}`)
        }

    }, [player.info.subtitleFontSize])

    React.useEffect(() => {
        if (forwardRef.current && player.info.isReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`)
            forwardRef.current.runCommand(`set|sub-color|${player.info.subtitleColor.shade}/${player.info.subtitleColor.alpha}`)
        }
    }, [player.info.subtitleColor])

    React.useEffect(() => {
        if (player.info.audioDelay !== undefined && forwardRef.current && player.info.isReady) {
            forwardRef.current.runCommand(`set|audio-delay|${player.info.audioDelay}`)
        }
    }, [player.info.audioDelay])

    React.useEffect(() => {
        if (player.info.subtitleDelay !== undefined && forwardRef.current && player.info.isReady) {
            forwardRef.current.runCommand(`set|sub-delay|${player.info.subtitleDelay}`)
        }
    }, [player.info.subtitleDelay])

    return (
        <Snow.Modal
            wrapper={false}
            onRequestClose={() => { player.action.onStopVideo() }}
            style={styles.wrapper}>
            <Libmpv.LibmpvVideo
                ref={forwardRef}
                playUrl={player.info.videoUrl}
                isPlaying={player.info.isPlaying}
                useHardwareDecoder={clientOptions.hardwareDecoder}
                surfaceWidth={player.info.videoWidth}
                surfaceHeight={player.info.videoHeight}
                onLibmpvEvent={(libmpvEvent) => {
                    player.action.onVideoUpdate({ kind: 'mpvevent', libmpvEvent })
                }}
                onLibmpvLog={(libmpvLog) => {
                    player.action.onVideoUpdate({ kind: 'mpvlog', libmpvLog })
                }}
                selectedAudioTrack={player.info.audioTrackIndex}
                selectedSubtitleTrack={player.info.subtitleTrackIndex}
                seekToSeconds={player.info.seekToSeconds}
            />
            <TouchableOpacity
                // Without this, the video has a white film over it
                activeOpacity={1}
                focusable={!player.info.controlsVisible}
                hasTVPreferredFocus={!player.info.controlsVisible}
                style={styles.touchable}
                onPress={player.action.onPauseVideo}>
            </TouchableOpacity>
        </Snow.Modal >
    )
}
