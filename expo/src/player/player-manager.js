import React from 'react'
import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'
import { usePlayerActions } from './player-actions'
import { playerSelectors } from './player-envelope'

export function PlayerManager(props) {
    const {
        apiClient,
        clientOptions,
        routes
    } = useAppContext()

    const {
        addActionListener,
        removeActionListener,
        navPush,
        navPop,
        navReset,
        clearModals,
        closeOverlay,
        currentRoute,
        envelope,
        getEnvelope,
        updateEnvelope,
        resetEnvelope,
        registerEnvelopeActions
    } = Snow.useSnowContext()

    const actions = usePlayerActions({
        apiClient,
        clientOptions,
        routes,
        currentRoute,
        navPush,
        navPop,
        navReset,
        clearModals,
        closeOverlay,
        updateEnvelope,
        getEnvelope,
        resetEnvelope
    })

    const actionsRef = React.useRef(actions)
    actionsRef.current = actions

    React.useEffect(() => {
        registerEnvelopeActions({
            setHandlers: (handlers) => actionsRef.current.setHandlers(handlers),
            loadVideo: () => actionsRef.current.loadVideo(),
            onPauseVideo: () => actionsRef.current.onPauseVideo(),
            onResumeVideo: () => actionsRef.current.onResumeVideo(),
            onStopVideo: (goHome) => actionsRef.current.onStopVideo(goHome),
            onProgress: (seconds, source, percent) => actionsRef.current.onProgress(seconds, source, percent),
            onVideoReady: () => actionsRef.current.onVideoReady(),
            onVideoUpdate: (eventInfo) => actionsRef.current.onVideoUpdate(eventInfo),
            onVideoError: (error) => actionsRef.current.onVideoError(error),
            savePlaybackLogs: () => actionsRef.current.savePlaybackLogs()
        })
    }, [registerEnvelopeActions])

    React.useEffect(() => {
        addActionListener('player-controls', {
            onRight: () => {
                const current = getEnvelope()
                if (playerSelectors.allowShortcuts(current)) {
                    actionsRef.current.onProgress((current.progressSeconds || 0) + 85, 'manual-seek')
                }
            },
            onLeft: () => {
                const current = getEnvelope()
                if (playerSelectors.allowShortcuts(current)) {
                    actionsRef.current.onProgress((current.progressSeconds || 0) - 7, 'manual-seek')
                }
            },
            onDown: () => {
                const current = getEnvelope()
                if (playerSelectors.allowShortcuts(current)) {
                    updateEnvelope((prev) => ({ subtitleFontScale: (prev.subtitleFontScale || 1.0) - 0.1 }))
                }
            },
            onUp: () => {
                const current = getEnvelope()
                if (playerSelectors.allowShortcuts(current)) {
                    updateEnvelope((prev) => {
                        const nextShade = Math.min(1.0, Math.max(0.0, (prev.subtitleColor?.shade || 1.0) - 0.15))
                        return { subtitleColor: { ...(prev.subtitleColor || {}), shade: nextShade } }
                    })
                }
            },
        })

        return () => {
            removeActionListener('player-controls')
        }
    }, [])

    React.useEffect(() => {
        if (apiClient && actionsRef.current.hasHandlers() && !envelope?.videoUrl && !envelope?.videoLoading) {
            actionsRef.current.loadVideo()
        }
    }, [apiClient, envelope?.videoUrl, envelope?.videoLoading, currentRoute])

    return props.children
}

export default PlayerManager