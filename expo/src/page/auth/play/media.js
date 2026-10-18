import React from 'react'
import Snow from 'expo-snowui'
import { C } from 'snowstream'
import SnowVideoPlayer from '../../../comp/snow-video-player'

const HANDLER_KEYS = [
    'loadVideo',
    'loadTranscode',
    'onComplete',
    'onStopVideo',
    'updateProgress',
    'increaseWatchCount'
]

export function PlayMediaPage(props) {
    const {
        currentRoute,
        emitHubEvent,
        resetHub,
        useHubState
    } = Snow.useSnowContext()

    const videoUrl = useHubState((state) => state?.videoUrl)
    const playbackFailed = useHubState((state) => state?.playbackFailed)
    const isTranscode = useHubState((state) => state?.isTranscode)
    const playerKind = useHubState((state) => state?.playerKind)

    const propsRef = React.useRef(props)
    propsRef.current = props

    React.useEffect(() => {
        return () => {
            resetHub()
        }
    }, [resetHub])

    React.useEffect(() => {
        const activeHandlers = {}

        for (const handlerKey of HANDLER_KEYS) {
            if (typeof propsRef.current[handlerKey] === 'function') {
                activeHandlers[handlerKey] = (...args) => propsRef.current[handlerKey]?.(...args)
            }
        }

        if (Object.keys(activeHandlers).length > 0) {
            emitHubEvent('player.setHandlers', activeHandlers)
        }

        emitHubEvent('player.loadVideo')
    }, [currentRoute?.routeParams?.transcode, emitHubEvent])

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
                    <C.SnowHeader style={{ flex: 1 }} center>Preparing a transcode for {playerKind}.</C.SnowHeader>
                    <C.SnowLabel style={{ flex: 1 }} center>This can take a while to load.</C.SnowLabel>
                </C.FillView>
            )
        }
        return (
            <C.FillView>
                <C.SnowHeader style={{ flex: 1 }} center>Getting the video for {playerKind}.</C.SnowHeader>
                <C.SnowLabel style={{ flex: 1 }} center>This should only take a moment.</C.SnowLabel>
            </C.FillView>
        )
    }

    return <SnowVideoPlayer />
}

export default PlayMediaPage