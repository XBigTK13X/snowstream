import React from 'react'
import Video from 'react-native-video';
import { View } from 'react-native'
import SnowText from './snow-text'
import SnowTextButton from './snow-text-button'

export default function RnvVideoView(props) {
    const videoRef = React.useRef(null);
    const [userPlayed, setUserPlayed] = React.useState(false)
    const [requestTranscode, setRequestTranscode] = React.useState(false)
    const [seekSeconds, setSeekSeconds] = React.useState(0)

    // Workaround for web not allowing videos to autoplay
    const userClickedPlay = () => {
        props.onReady()
        setUserPlayed(true)
    }

    const onError = (err) => {
        if (props.onError) {
            err.kind = 'rnv'
            props.onError(err)
        }
    }

    React.useEffect(() => {
        if (!requestTranscode) {
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

    return (
        <Video
            source={{ uri: props.videoUrl }}
            ref={videoRef}
            paused={!props.isPlaying}
            muted={!props.isPlaying}
            onEnd={() => { props.onUpdate({ kind: 'rnvevent', data: { playbackFinished: true } }) }}
            onError={onError}
            onProgress={(data) => { props.onUpdate({ kind: 'rnvevent', data: data }) }}
            selectedAudioTrack={{ type: 'index', value: props.audioIndex }}
            selectedTextTrack={{ type: 'index', value: props.subtitleIndex }}
        />
    )
}
