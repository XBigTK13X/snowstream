import React from 'react'
import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'
import { usePlayerActions } from './player-actions'
import { initialPlayerHubState, resolvePlaybackConfig } from './player-hub'

const canShortcut = (state) => {
    return !!(
        state.isPlaying &&
        !state.controlsVisible &&
        !state.logsVisible &&
        !state.isTranscode
    )
}

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
        getHubState,
        sendHubData,
        emitHubEvent,
        onHubEvent,
        resetHub,
        useHubState
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
        sendHubData,
        getHubState,
        resetHub,
        emitHubEvent
    })

    const actionsRef = React.useRef(actions)
    actionsRef.current = actions

    const hubRef = React.useRef({ getHubState, sendHubData })
    hubRef.current = { getHubState, sendHubData }

    const inputRef = React.useRef({ addActionListener, removeActionListener })
    inputRef.current = { addActionListener, removeActionListener }

    const videoUrl = useHubState((state) => state?.videoUrl)
    const videoLoading = useHubState((state) => state?.videoLoading)

    React.useEffect(() => {
        const config = resolvePlaybackConfig(currentRoute?.routeParams, clientOptions)
        resetHub({
            ...initialPlayerHubState,
            ...config
        })
    }, [currentRoute?.routeParams?.videoId, resetHub, clientOptions])

    React.useEffect(() => {
        const subscriptions = [
            onHubEvent('player.setHandlers', (handlers) => actionsRef.current.setHandlers(handlers)),
            onHubEvent('player.loadVideo', () => actionsRef.current.loadVideo()),
            onHubEvent('player.pause', () => actionsRef.current.onPauseVideo()),
            onHubEvent('player.resume', () => actionsRef.current.onResumeVideo()),
            onHubEvent('player.stop', (payload) => actionsRef.current.onStopVideo(payload?.goHome)),
            onHubEvent('player.progress', (payload) => actionsRef.current.onProgress(payload?.seconds, payload?.source, payload?.percent)),
            onHubEvent('player.ready', () => actionsRef.current.onVideoReady()),
            onHubEvent('player.update', (eventInfo) => actionsRef.current.onVideoUpdate(eventInfo)),
            onHubEvent('player.error', (error) => actionsRef.current.onVideoError(error)),
            onHubEvent('player.saveLogs', () => actionsRef.current.savePlaybackLogs())
        ]

        return () => {
            subscriptions.forEach((unsubscribe) => {
                unsubscribe()
            })
        }
    }, [onHubEvent])

    React.useEffect(() => {
        inputRef.current.addActionListener('player-controls', {
            onRight: () => {
                const current = hubRef.current.getHubState()
                if (canShortcut(current)) {
                    actionsRef.current.onProgress((current.progressSeconds || 0) + 85, 'manual-seek')
                }
            },
            onLeft: () => {
                const current = hubRef.current.getHubState()
                if (canShortcut(current)) {
                    actionsRef.current.onProgress((current.progressSeconds || 0) - 7, 'manual-seek')
                }
            },
            onDown: () => {
                const current = hubRef.current.getHubState()
                if (canShortcut(current)) {
                    hubRef.current.sendHubData((prevState) => ({
                        subtitleFontScale: (prevState.subtitleFontScale || 1.0) - 0.1
                    }), 'player.subtitleScaleChanged')
                }
            },
            onUp: () => {
                const current = hubRef.current.getHubState()
                if (canShortcut(current)) {
                    hubRef.current.sendHubData((prevState) => {
                        const nextShade = Math.min(1.0, Math.max(0.0, (prevState.subtitleColor?.shade || 1.0) - 0.15))
                        return {
                            subtitleColor: { ...(prevState.subtitleColor || {}), shade: nextShade }
                        }
                    }, 'player.subtitleColorChanged')
                }
            }
        })

        return () => {
            inputRef.current.removeActionListener('player-controls')
        }
    }, [])

    React.useEffect(() => {
        if (apiClient && actionsRef.current.hasHandlers() && !videoUrl && !videoLoading) {
            actionsRef.current.loadVideo()
        }
    }, [apiClient, videoUrl, videoLoading, currentRoute])

    return props.children
}

export default PlayerManager