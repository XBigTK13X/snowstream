import React from 'react'
import Snow from 'expo-snowui'
import { useSnapshot } from 'valtio'
import { useAppContext } from '../app-context'
import { playerState } from './player-state'
import { playerActions } from './player-actions'

export function PlayerManager(props) {
    const {
        addActionListener,
        removeActionListener,
        navPush,
        navPop,
        clearModals,
        disableOverlay,
        currentRoute
    } = Snow.useSnowContext()
    const {
        apiClient,
        clientOptions,
        config,
        routes
    } = useAppContext()


    let player = useSnapshot(playerState)

    const [setup, setSetup] = React.useState(false)

    React.useEffect(() => {
        if (!setup) {
            if (apiClient && clientOptions && config && routes && currentRoute) {
                playerActions.setRuntimeDeps({
                    apiClient,
                    clientOptions,
                    config,
                    routes,
                    addActionListener,
                    removeActionListener,
                    navPush,
                    navPop,
                    currentRoute,
                    clearModals,
                    disableOverlay
                })
                addActionListener('player-controls', {
                    onRight: () => {
                        if (player.allowShortcutsRef.current) {
                            playerActions.onProgress(player.progressSecondsRef.current + 85, 'manual-seek')
                        }
                    },
                    onLeft: () => {
                        if (player.allowShortcutsRef.current) {
                            playerActions.onProgress(player.progressSecondsRef.current - 7, 'manual-seek')
                        }
                    },
                    onDown: () => {
                        if (player.allowShortcutsRef.current) {
                            playerActions.setSubtitleFontSize(player.subtitleFontSize - 4)
                        }
                    },
                    onUp: () => {
                        if (player.allowShortcutsRef.current) {
                            const nextSubtitleColor = { ...player.subtitleColor }
                            nextSubtitleColor.shade -= 0.15
                            if (nextSubtitleColor.shade < 0) nextSubtitleColor.shade = 0.0
                            playerActions.setSubtitleColor(nextSubtitleColor)
                        }
                    },
                })

                setSetup(true)
                return () => {
                    removeActionListener('player-controls')
                }
            }
        } else {
            playerState.currentRoute = currentRoute
        }
    }, [apiClient, currentRoute])

    React.useEffect(() => {
        playerState.clientOptions = clientOptions
    }, [clientOptions])

    React.useEffect(() => {
        player.allowShortcutsRef.current =
            (!player.controlsVisible &&
                player.isReady &&
                !player.isTranscode &&
                player.initialSeekComplete) ||
            !player.initialSeekSeconds
    },
        [
            player.controlsVisible,
            player.isReady,
            player.isTranscode,
            player.initialSeekComplete,
            player.initialSeekSeconds,
        ]
    )

    React.useEffect(() => {
        player.progressSecondsRef.current = player.progressSeconds ?? 0
    }, [player.progressSeconds])

    React.useEffect(() => {
        if (setup) {
            if (!player.videoLoading && !player.manualSeekSeconds) {

                if (player.currentRoute?.routeParams?.audioTrack) {
                    playerState.audioTrackIndex = parseInt(player.currentRoute.routeParams.audioTrack, 10)
                }
                if (player.currentRoute?.routeParams?.subtitleTrack) {
                    playerState.subtitleTrackIndex = parseInt(player.currentRoute.routeParams.subtitleTrack, 10)
                }
                if (player.isTranscode) {
                    if (player.loadTranscode) {
                        playerState.videoLoading = true
                        playerActions.onAddLog({
                            kind: 'snowstream',
                            message: 'firing off a loadTranscode',
                            routeParams: player.currentRoute.routeParams,
                        })
                        playerState
                            .loadTranscode(
                                player.apiClient,
                                player.currentRoute.routeParams,
                                player.clientOptions.deviceProfile,
                                player.initialSeekSeconds
                            )
                            .then(playerActions.loadVideo.bind(playerActions))
                    }
                } else {
                    if (player.loadVideo) {
                        playerState.videoLoading = true
                        playerActions.onAddLog({
                            kind: 'snowstream',
                            message: 'firing off a loadVideo',
                            routeParams: player.currentRoute.routeParams,
                        })
                        playerState
                            .loadVideo(
                                player.apiClient,
                                player.currentRoute.routeParams,
                                player.clientOptions.deviceProfile
                            )
                            .then(playerActions.loadVideo.bind(playerActions))
                    }
                }
            }
        }
    }, [
        player.videoLoading,
        player.manualSeekSeconds,
        player.isTranscode,
        player.apiClient,
        player.currentRoute,
        player.clientOptions,
        player.initialSeekSeconds,
        player.loadVideo,
        player.loadTranscode
    ])

    return props.children
}

export default PlayerManager