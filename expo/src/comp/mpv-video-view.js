import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from 'expo-router'
import { useAppContext } from '../app-context'
import { usePlayerContext } from '../player-context'
import Style from '../snow-style'
import SnowModal from './snow-modal'

// https://mpv.io/manual/master/#property-manipulation
export default function MpvVideoView(props) {
    const player = usePlayerContext()
    const { clientOptions } = useAppContext()
    const styles = {
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
        },
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
            backgroundColor: 'black'
        }
    }

    // Don't want it being included outside of Android
    // Don't trying importing it until first render
    const Libmpv = require('react-native-libmpv')

    const nativeRef = React.useRef(null);

    React.useEffect(() => {
        if (!player.info.isReady) {
            if (nativeRef.current && clientOptions.audioCompression) {
                // Loudness normalization from Snowby
                nativeRef.current.runMpvCommand(`set|af|acompressor=ratio=4,loudnorm`)
            }
            player.action.onReady()
        }
    })

    React.useEffect(() => {
        if (nativeRef.current) {
            nativeRef.current.runMpvCommand(`set|sub-ass-override|force`)
            nativeRef.current.runMpvCommand(`set|sub-font-size|${player.info.subtitleFontSize}`)
        }

    }, [player.info.subtitleFontSize])

    React.useEffect(() => {
        if (nativeRef.current) {
            nativeRef.current.runMpvCommand(`set|sub-ass-override|force`)
            nativeRef.current.runMpvCommand(`set|sub-color|${player.info.subtitleColor.shade}/${player.info.subtitleColor.alpha}`)
        }
    }, [player.info.subtitleColor])

    React.useEffect(() => {
        if (nativeRef.current) {
            nativeRef.current.runMpvCommand(`set|audio-delay|${player.info.audioDelay}`)
        }
    }, [player.info.audioDelay])

    React.useEffect(() => {
        if (nativeRef.current) {
            nativeRef.current.runMpvCommand(`set|sub-delay|${player.info.subtitleDelay}`)
        }
    }, [player.info.subtitleDelay])

    return (
        <SnowModal
            wrapper={false}
            onRequestClose={() => { player.stopVideo() }}
            style={styles.wrapper}>

            <Libmpv.LibmpvVideo
                ref={nativeRef}
                playUrl={player.info.videoUrl}
                isPlaying={player.info.isPlaying}
                useHardwareDecoder={clientOptions.hardwareDecoder}
                surfaceWidth={player.info.videoWidth}
                surfaceHeight={player.info.videoHeight}
                onLibmpvEvent={(libmpvEvent) => {
                    player.action.onUpdate({ kind: 'mpvevent', libmpvEvent })
                }}
                onLibmpvLog={(libmpvLog) => {
                    player.action.onUpdate({ kind: 'mpvlog', libmpvLog })
                }}
                selectedAudioTrack={player.info.audioIndex}
                selectedSubtitleTrack={player.info.subtitleIndex}
                seekToSeconds={player.info.seekToSeconds}
            />
            <TouchableOpacity
                hasTVPreferredFocus={player.info.shouldFocus}
                style={styles.touchable}
                onPress={player.action.pauseVideo}>
            </TouchableOpacity>
        </SnowModal >
    )
}
