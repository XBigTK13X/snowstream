import React from 'react'
import Snow from '@snowsuite/expo-snowui'
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
        useHubState
    } = Snow.useSnowContext()

    const playbackFailed = useHubState((state) => state?.playbackFailed)

    const propsRef = React.useRef(props)
    propsRef.current = props

    const mediaId = currentRoute?.routeParams?.id || currentRoute?.routeParams?.videoId

    React.useEffect(() => {
        return () => {
            emitHubEvent('player.setHandlers', {})
            emitHubEvent('player.reset')
        }
    }, [emitHubEvent])

    React.useEffect(() => {
        emitHubEvent('player.reset')

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
    }, [mediaId, currentRoute?.routeParams?.transcode, emitHubEvent])

    if (playbackFailed) {
        return (
            <C.FillView>
                <C.SnowHeader center>Unable to play the video.</C.SnowHeader>
                <C.SnowText>Error: {Snow.stringifySafe(playbackFailed)}</C.SnowText>
            </C.FillView>
        )
    }

    return <SnowVideoPlayer />
}

export default PlayMediaPage