import _ from 'lodash'
import React from 'react'
import Snow from 'expo-snowui'
import { useSnapshot, subscribe } from 'valtio'
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
        console.log("First effect")
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
            if (currentRoute.routePath !== playerState.routePath) {
                playerState.routePath = currentRoute.routePath
            }
            if (!_.isEqual(currentRoute.routeParams, playerState.routeParams)) {
                playerState.routeParams = currentRoute.routeParams
            }
        }
    }, [apiClient, currentRoute])

    React.useEffect(() => {
        console.log({ clientOptions })
        playerState.clientOptions = clientOptions
    }, [clientOptions])

    React.useEffect(() => {
        const unsub = subscribe(playerState, () => {
            console.log({ playerState3: playerState })

            playerActions.effectLoadVideo()
            playerActions.effectAllowShortcuts()
        })
        return unsub
    }, [])

    return props.children
}

export default PlayerManager