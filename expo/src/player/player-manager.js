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
        closeOverlay,
        currentRoute
    } = Snow.useSnowContext()
    const {
        apiClient,
        clientOptions,
        config,
        routes
    } = useAppContext()


    let player = useSnapshot(playerState)

    React.useEffect(() => {
        if (!player.apiClient) {
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
                    closeOverlay
                })
                addActionListener('player-controls', {
                    onRight: () => {
                        if (player.allowShortcuts) {
                            playerActions.onProgress(player.progressSeconds + 85, 'manual-seek')
                        }
                    },
                    onLeft: () => {
                        if (player.allowShortcuts) {
                            playerActions.onProgress(player.progressSeconds - 7, 'manual-seek')
                        }
                    },
                    onDown: () => {
                        if (player.allowShortcuts) {
                            playerActions.setSubtitleFontSize(player.subtitleFontSize - 4)
                        }
                    },
                    onUp: () => {
                        if (player.allowShortcuts) {
                            const nextSubtitleColor = { ...player.subtitleColor }
                            nextSubtitleColor.shade -= 0.15
                            if (nextSubtitleColor.shade < 0) nextSubtitleColor.shade = 0.0
                            playerActions.setSubtitleColor(nextSubtitleColor)
                        }
                    },
                })

                return () => {
                    removeActionListener('player-controls')
                }
            }
        } else {
            playerState.routePath = currentRoute.routePath
            playerState.routeParams = currentRoute.routeParams
        }
    }, [apiClient, currentRoute])

    React.useEffect(() => {
        playerState.clientOptions = clientOptions
    }, [clientOptions])

    React.useEffect(() => {
        if (!player.controlsVisible &&
            player.isReady &&
            !player.isTranscode &&
            player.initialSeekComplete ||
            !player.initialSeekSeconds) {
            playerState.allowShortcuts = true
        }
        else {
            playerState.allowShortcuts = false
        }
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
        console.log({
            action: 'pm-refresh',
            player
        })
        if (player.apiClient) {
            if (!player.videoLoading && !player.manualSeekSeconds) {
                if (player.routeParams?.audioTrack) {
                    playerState.audioTrackIndex = parseInt(player.routeParams?.audioTrack, 10)
                }
                if (player.routeParams?.subtitleTrack) {
                    playerState.subtitleTrackIndex = parseInt(player.routeParams?.subtitleTrack, 10)
                }
                if (player.isTranscode) {
                    if (player.loadTranscode) {
                        playerState.videoLoading = true
                        playerActions.onAddLog({
                            kind: 'snowstream',
                            message: 'firing off a loadTranscode',
                            routeParams: player.routeParams,
                        })
                        playerState.loadTranscode(
                            player.apiClient,
                            player.routeParams,
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
                            routeParams: player.routeParams,
                        })
                        playerState
                            .loadVideo(
                                player.apiClient,
                                player.routeParams,
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
        player.routePath,
        player.routeParams,
        player.clientOptions,
        player.initialSeekSeconds,
        player.loadVideo,
        player.loadTranscode
    ])

    return props.children
}

export default PlayerManager