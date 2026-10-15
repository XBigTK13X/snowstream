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
        getEnvelope,
        updateEnvelope,
        resetEnvelope,
        getHandlers
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
        resetEnvelope,
        get handlers() {
            return getHandlers ? getHandlers() : {}
        }
    })

    const actionsRef = React.useRef(actions)
    actionsRef.current = actions

    const envelope = getEnvelope()

    // Auto-load video when parameters are mounted
    React.useEffect(() => {
        if (!envelope?.videoUrl && !envelope?.videoLoading) {
            actionsRef.current.loadVideo()
        }
    }, [envelope?.videoUrl, envelope?.videoLoading, currentRoute])

    // Cleanup envelope on route unmount
    React.useEffect(() => {
        return () => {
            actionsRef.current.onStopVideo()
            resetEnvelope()
        }
    }, [])

    // Register remote listeners once on mount
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
                    updateEnvelope((prev) => ({ subtitleFontScale: prev.subtitleFontScale - 0.1 }))
                }
            },
            onUp: () => {
                const current = getEnvelope()
                if (playerSelectors.allowShortcuts(current)) {
                    updateEnvelope((prev) => {
                        const nextShade = Math.min(1.0, Math.max(0.0, prev.subtitleColor.shade - 0.15))
                        return { subtitleColor: { ...prev.subtitleColor, shade: nextShade } }
                    })
                }
            },
        })

        return () => {
            removeActionListener('player-controls')
        }
    }, [])

    return props.children
}

export default PlayerManager