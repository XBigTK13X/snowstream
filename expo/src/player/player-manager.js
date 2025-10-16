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
        playerActions.importContexts({
            apiClient,
            clearModals,
            clientOptions,
            closeOverlay,
            config,
            currentRoute,
            navPop,
            navPush,
            routes,
        })
    }, [
        apiClient,
        clearModals,
        clientOptions,
        closeOverlay,
        config,
        currentRoute,
        navPop,
        navPush,
        routes,
    ])

    React.useEffect(() => {
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
    }, [player.videoLoaded])

    React.useEffect(() => {
        const unsubscribe = subscribe(playerState, () => {
            if (playerState.readyToLoad) {
                playerActions.effectLoadVideo()
                playerActions.effectAllowShortcuts()
            }
        })
        return () => { unsubscribe() }
    }, [])

    return props.children
}

export default PlayerManager