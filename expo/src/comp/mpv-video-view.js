import React from 'react'
import { useNavigation } from 'expo-router'

const uhd = {
    width: 3840,
    height: 2160
}

// https://mpv.io/manual/master/#property-manipulation
export default function MpvVideoView(props) {
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
            Libmpv.command("set|vf|no")
            Libmpv.command("set|af|no")
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
    )
}
