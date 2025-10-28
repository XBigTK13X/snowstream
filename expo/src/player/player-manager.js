import _ from 'lodash'
import React from 'react'
import Snow from 'expo-snowui'
import { useSnapshot, subscribe, snapshot } from 'valtio'
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
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.onProgress(handlerState.progressSeconds + 85, 'manual-seek')
                }
            },
            onLeft: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.onProgress(handlerState.progressSeconds - 7, 'manual-seek')
                }
            },
            onDown: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.changeSubtitleFontSize(-1)
                }
            },
            onUp: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.changeSubtitleColor(-1)
                }
            },
        })

        return () => {
            removeActionListener('player-controls')
        }
    }, [])

    React.useEffect(() => {
        const unsubscribe = subscribe(playerState, () => {
            playerActions.effectLoadVideo()
        })
        return () => { unsubscribe() }
    }, [])

    return props.children
}

export default PlayerManager