import React from 'react'
import Snow from 'expo-snowui'
import { C } from 'snowstream'
import SnowVideoPlayer from '../../../comp/snow-video-player'
import { playerSelectors } from '../../../player/player-envelope'
import { useAppContext } from '../../../app-context'

export function PlayMediaPage(props) {
    const {
        envelope,
        resetEnvelope,
        dispatchEnvelopeAction,
        currentRoute
    } = Snow.useSnowContext()
    const { clientOptions } = useAppContext()

    const routeParams = currentRoute?.routeParams || {}
    const isTranscode = playerSelectors.isTranscode(envelope, routeParams, clientOptions)

    React.useEffect(() => {
        dispatchEnvelopeAction('setHandlers', {
            loadVideo: props.loadVideo,
            loadTranscode: props.loadTranscode,
            onComplete: props.onComplete,
            onStopVideo: props.onStopVideo,
            updateProgress: props.updateProgress,
            increaseWatchCount: props.increaseWatchCount
        })

        dispatchEnvelopeAction('loadVideo')

        return () => {
            resetEnvelope()
        }
    }, [])

    if (envelope?.playbackFailed) {
        return (
            <C.FillView>
                <C.SnowHeader center>Unable to play the video.</C.SnowHeader>
                <C.SnowText>Error: {Snow.stringifySafe(envelope.playbackFailed)}</C.SnowText>
            </C.FillView>
        )
    }

    if (!envelope?.videoUrl) {
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