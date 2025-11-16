import _ from 'lodash'
import React from 'react'
import Snow from 'expo-snowui'
import { subscribe, snapshot } from 'valtio'
import { useToast } from 'expo-toast';

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

    const toast = useToast();

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

    const warn = () => {
        toast.show('Remote shortcut buttons disabled during transcode.', {
            duration: 1000,
            position: 'bottom',
        });
    }

    React.useEffect(() => {
        addActionListener('player-controls', {
            onRight: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.onProgress(handlerState.progressSeconds + 85, 'manual-seek')
                }
                if (handlerState.isTranscode) {
                    //warn()
                }
            },
            onLeft: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.onProgress(handlerState.progressSeconds - 7, 'manual-seek')
                }
                if (handlerState.isTranscode) {
                    //warn()
                }
            },
            onDown: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.changeSubtitleFontScale(-1)
                }
                if (handlerState.isTranscode) {
                    //warn()
                }
            },
            onUp: () => {
                const handlerState = snapshot(playerState)
                if (handlerState.allowShortcuts) {
                    playerActions.changeSubtitleColor(-1)
                }
                if (handlerState.isTranscode) {
                    //warn()
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