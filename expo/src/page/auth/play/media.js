import React from 'react'
import Snow from 'expo-snowui'
import { C } from 'snowstream'
import SnowVideoPlayer from '../../../comp/snow-video-player'

export function PlayMediaPage(props) {
    const {
        emitHubEvent,
        resetHub,
        useHubState
    } = Snow.useSnowContext()

    const videoUrl = useHubState((state) => state?.videoUrl)
    const playbackFailed = useHubState((state) => state?.playbackFailed)
    const isTranscode = useHubState((state) => state?.isTranscode)

    const propsRef = React.useRef(props)
    propsRef.current = props

    React.useEffect(() => {
        return () => {
            resetHub()
        }
    }, [])

    React.useEffect(() => {
        emitHubEvent('player.setHandlers', {
            loadVideo: (...args) => propsRef.current.loadVideo?.(...args),
            loadTranscode: (...args) => propsRef.current.loadTranscode?.(...args),
            onComplete: (...args) => propsRef.current.onComplete?.(...args),
            onStopVideo: (...args) => propsRef.current.onStopVideo?.(...args),
            updateProgress: (...args) => propsRef.current.updateProgress?.(...args),
            increaseWatchCount: (...args) => propsRef.current.increaseWatchCount?.(...args)
        })

        emitHubEvent('player.loadVideo')
    }, [])

    if (playbackFailed) {
        return (
            <C.FillView>
                <C.SnowHeader center>Unable to play the video.</C.SnowHeader>
                <C.SnowText>Error: {Snow.stringifySafe(playbackFailed)}</C.SnowText>
            </C.FillView>
        )
    }

    if (!videoUrl) {
        if (isTranscode) {
            return (
                <C.FillView>
                    <C.SnowHeader style={{ flex: 1 }} center>Preparing a transcode.</C.SnowHeader>
                    <C.SnowLabel style={{ flex: 1 }} center>This can take a while to load.</C.SnowLabel>
                </C.FillView>
            )
        }
        return (
            <C.FillView>
                <C.SnowHeader style={{ flex: 1 }} center>Getting the video.</C.SnowHeader>
                <C.SnowLabel style={{ flex: 1 }} center>This should only take a moment.</C.SnowLabel>
            </C.FillView>
        )
    }

    return <SnowVideoPlayer />
}

export default PlayMediaPage