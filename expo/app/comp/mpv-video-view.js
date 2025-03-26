import React from 'react'
import { useNavigation } from 'expo-router'

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
            navigation.addListener('beforeRemove', (e) => {
                Libmpv.cleanup()
            })
            setCleanup(true)
        }
    })

    return (
        <LibmpvVideo
            playUrl={props.videoUrl}
            isPlaying={props.isPlaying}
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
