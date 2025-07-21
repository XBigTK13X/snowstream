import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from 'expo-router'
import Style from '../snow-style'
import SnowModal from './snow-modal'

// https://mpv.io/manual/master/#property-manipulation
export default function MpvVideoView(props) {
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
        },
        video: {
            width: Style.window.width(),
            height: Style.window.height(),
            position: 'absolute',
            alignSelf: 'center',
            backgroundColor: 'black',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
    }

    // We don't want it being included outside of Android
    // So don't trying importing it until first render
    const Libmpv = require('react-native-libmpv')

    const nativeRef = React.useRef(null);

    React.useEffect(() => {
        // Loudness normalization from Snowby
        //Libmpv.command('set|af|acompressor=ratio=4,loudnorm')
        if (!props.isReady && props.onReady) {
            props.onReady()
        }
    })

    React.useEffect(() => {
        if (nativeRef.current) {
            nativeRef.current.runMpvCommand(`set|sub-ass-override|force`)
            nativeRef.current.runMpvCommand(`set|sub-font-size|${props.subtitleFontSize}`)
        }

    }, [props.subtitleFontSize])

    React.useEffect(() => {
        if (nativeRef.current) {
            nativeRef.current.runMpvCommand(`set|sub-ass-override|force`)
            nativeRef.current.runMpvCommand(`set|sub-color|${props.subtitleColor.shade}/${props.subtitleColor.alpha}`)
        }
    }, [props.subtitleColor])

    return (
        <SnowModal
            wrapper={false}
            onRequestClose={() => { props.stopVideo() }}
            style={styles.wrapper}>

            <Libmpv.LibmpvVideo
                ref={nativeRef}
                playUrl={props.videoUrl}
                isPlaying={props.isPlaying}
                surfaceWidth={props.videoWidth}
                surfaceHeight={props.videoHeight}
                onLibmpvEvent={(libmpvEvent) => {
                    if (props.onUpdate) {
                        props.onUpdate({ kind: 'mpvevent', libmpvEvent })
                    }
                }}
                onLibmpvLog={(libmpvLog) => {
                    if (props.onUpdate) {
                        props.onUpdate({ kind: 'mpvlog', libmpvLog })
                    }
                }}
                selectedAudioTrack={props.audioIndex}
                selectedSubtitleTrack={props.subtitleIndex}
                seekToSeconds={props.seekToSeconds}
            />
            <TouchableOpacity
                hasTVPreferredFocus={props.shouldFocus}
                style={styles.touchable}
                onPress={props.pauseVideo}>
            </TouchableOpacity>
        </SnowModal >
    )
}
