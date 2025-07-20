import React from 'react'
import { AppState, TouchableOpacity } from 'react-native'
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
    const navigation = useNavigation()
    let libmpv = require('react-native-libmpv')
    let Libmpv = libmpv.Libmpv
    let LibmpvVideo = libmpv.LibmpvVideo

    const [cleaned, setCleaned] = React.useState(false)

    React.useEffect(() => {
        // Loudness normalization from Snowby
        //Libmpv.command('set|af|acompressor=ratio=4,loudnorm')
        if (!props.isReady && props.onReady) {
            props.onReady()
        }
    })

    React.useEffect(() => {
        const navListener = navigation.addListener('beforeRemove', (e) => {
            if (!cleaned) {
                Libmpv.cleanup()
                setCleaned(true)
            }
        })
        return () => {
            navigation.removeListener('beforeRemove', navListener)
        }
    }, [])

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                if (!cleaned) {
                    Libmpv.cleanup()
                    setCleaned(true)
                }
            }
        });

        return () => {
            appStateSubscription.remove();
        };
    }, []);

    React.useEffect(() => {
        Libmpv.command(`set|sub-ass-override|force`)
        Libmpv.command(`set|sub-font-size|${props.subtitleFontSize}`)
    }, [props.subtitleFontSize])

    React.useEffect(() => {
        Libmpv.command(`set|sub-ass-override|force`)
        Libmpv.command(`set|sub-color|${props.subtitleColor.shade}/${props.subtitleColor.alpha}`)
    }, [props.subtitleColor])

    if (cleaned) {
        return null
    }

    return (
        <SnowModal
            wrapper={false}
            onRequestClose={() => { props.stopVideo() }}
            style={styles.wrapper}>

            <LibmpvVideo
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
