import React from 'react'
import { useNavigation } from 'expo-router'

export default function MpvVideoView(props) {
    const navigation = useNavigation()
    let libmpv = require('react-native-libmpv')
    let Libmpv = libmpv.Libmpv
    let LibmpvVideo = libmpv.LibmpvVideo

    React.useEffect(() => {
        if (!props.isReady && props.onReady) {
            props.onReady()
        }
        const cleanup = navigation.addListener('beforeRemove', (e) => {
            if (Libmpv && Libmpv.cleanup) {
                Libmpv.cleanup()
            }
            return
        })
        return cleanup
    }, [navigation])

    if (!props.isPlaying) {
        if (Libmpv && Libmpv.pause) {
            Libmpv.pause()
        }
    }

    if (props.isPlaying) {
        if (Libmpv && Libmpv.unpause) {
            Libmpv.unpause()
        }
    }

    return (
        <LibmpvVideo
            playUrl={props.videoUrl}
            onLibmpvEvent={(libmpvEvent) => {
                if (props.onUpdate) {
                    props.onUpdate({ kind: 'event', libmpvEvent })
                }
            }}
            onLibmpvLog={(libmpvLog) => {
                if (props.onUpdate) {
                    props.onUpdate({ kind: 'log', libmpvLog })
                }
            }}
        />
    )
}
