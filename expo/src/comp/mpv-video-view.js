import React from 'react'
import { TouchableOpacity } from 'react-native'
import Snow, { useStyleContext } from 'expo-snowui'
// Don't want it being included outside of Android
// Don't trying importing it until first render
import { LibmpvVideo } from 'expo-libmpv'
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

    const forwardRef = React.useRef(null);

    React.useEffect(() => {
        if (!player.info.isReady && forwardRef.current?.runCommand) {
            if (clientOptions.useFastMpv) {
                try {
                    forwardRef.current.runCommand(`set|hwdec|mediacodec`).catch(() => { })
                    forwardRef.current.runCommand(`set|vo|gpu`).catch(() => { })
                    forwardRef.current.runCommand(`set|profile|fast`).catch(() => { })
                    forwardRef.current.runCommand(`set|gpu-context|android`).catch(() => { })
                    forwardRef.current.runCommand(`set|scale|bilinear`).catch(() => { })
                    forwardRef.current.runCommand(`set|dscale|bilinear`).catch(() => { })
                    forwardRef.current.runCommand(`set|interpolation|no`).catch(() => { })
                    forwardRef.current.runCommand(`set|video-sync|display-resample`).catch(() => { })
                    forwardRef.current.runCommand(`set|opengl-es|yes`).catch(() => { })
                    forwardRef.current.runCommand(`set|audio-buffer|0.2`).catch(() => { })
                    forwardRef.current.runCommand(`set|cache|yes`).catch(() => { })
                }
                catch { }
            }
            else {
                if (clientOptions.audioCompression) {
                    // Loudness normalization from Snowby
                    forwardRef.current.runCommand(`set|af|acompressor=ratio=4,loudnorm`).catch(() => { })
                }
            }
            player.action.onVideoReady()
        }
    })

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.info.isReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`).catch(() => { })
            forwardRef.current.runCommand(`set|sub-font-size|${player.info.subtitleFontSize}`).catch(() => { })
        }

    }, [player.info.subtitleFontSize])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.info.isReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`).catch(() => { })
            forwardRef.current.runCommand(`set|sub-color|${player.info.subtitleColor.shade}/${player.info.subtitleColor.alpha}`).catch(() => { })
        }
    }, [player.info.subtitleColor])

    React.useEffect(() => {
        if (player.info.audioDelay !== undefined && forwardRef.current?.runCommand && player.info.isReady) {
            forwardRef.current.runCommand(`set|audio-delay|${player.info.audioDelay}`).catch(() => { })
        }
    }, [player.info.audioDelay])

    React.useEffect(() => {
        if (player.info.subtitleDelay !== undefined && forwardRef.current?.runCommand && player.info.isReady) {
            forwardRef.current.runCommand(`set|sub-delay|${player.info.subtitleDelay}`).catch(() => { })
        }
    }, [player.info.subtitleDelay])

    return (
        <Snow.Modal
            focusStart
            focusLayer="mpv-view"
            wrapper={false}
            onRequestClose={() => { player.action.onStopVideo() }}
            style={styles.wrapper}>
            <LibmpvVideo
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
                style={styles.touchable}
                onPress={player.action.onPauseVideo}>
            </TouchableOpacity>
        </Snow.Modal >
    )
}
