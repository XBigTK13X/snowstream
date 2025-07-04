import React from 'react'
import { Modal, TouchableOpacity } from 'react-native'
import { useNavigation } from 'expo-router'
import { StaticStyle } from '../snow-style'

const uhd = {
    width: 3840,
    height: 2160
}

// https://mpv.io/manual/master/#property-manipulation
export default function MpvVideoView(props) {
    const styles = {
        touchable: {
            width: StaticStyle.window.width(),
            height: StaticStyle.window.height(),
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        wrapper: {
            width: StaticStyle.window.width(),
            height: StaticStyle.window.height(),
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
            right: 0
        },
    }
    const navigation = useNavigation()
    let libmpv = require('react-native-libmpv')
    let Libmpv = libmpv.Libmpv
    let LibmpvVideo = libmpv.LibmpvVideo

    const [cleanup, setCleanup] = React.useState(false)

    React.useEffect(() => {
        if (!props.isReady && props.onReady) {
            props.onReady()
        }
        if (!cleanup) {
            //Libmpv.command("set|vf|no")
            //Libmpv.command("set|af|no")
            Libmpv.command("set|cache-secs|5")
            Libmpv.command("set|demuxer-readahead-secs|5")
            navigation.addListener('beforeRemove', (e) => {
                Libmpv.cleanup()
            })
            setCleanup(true)
        }
    })

    React.useEffect(() => {
        Libmpv.command(`set|sub-ass-override|force`)
        Libmpv.command(`set|sub-font-size|${props.subtitleFontSize}`)
    }, [props.subtitleFontSize])

    React.useEffect(() => {
        Libmpv.command(`set|sub-ass-override|force`)
        Libmpv.command(`set|sub-color|${props.subtitleColor.shade}/${props.subtitleColor.alpha}`)
    }, [props.subtitleColor])

    return (
        <Modal
            onRequestClose={props.stopVideo}
            style={styles.wrapper}>
            <TouchableOpacity
                hasTVPreferredFocus={props.shouldFocus}
                style={styles.touchable}
                onPress={props.showControls}>
                <LibmpvVideo
                    playUrl={props.videoUrl}
                    isPlaying={props.isPlaying}
                    surfaceWidth={uhd.width}
                    surfaceHeight={uhd.height}
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
            </TouchableOpacity>
        </Modal >
    )
}
