import React from 'react'
import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'
import { useSnapshot } from 'valtio'
import { playerState } from './player-state'
import { playerActions } from './player-actions'

export default function PlayerManager(props) {
    const { apiClient, clientOptions, config, routes } = useAppContext()
    const { addActionListener, removeActionListener, navPush, navPop, currentRoute } = Snow.useSnowContext()
    const playerSnapshot = useSnapshot(playerState)

    React.useEffect(() => {
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
        })
    }, [apiClient, clientOptions, config, routes, addActionListener, removeActionListener, navPush, navPop, currentRoute])

    React.useEffect(() => {
        addActionListener('player-controls', {
            onRight: () => {
                if (playerState.allowShortcutsRef.current) {
                    playerActions.onProgress(playerState.progressSecondsRef.current + 85, 'manual-seek')
                }
            },
            onLeft: () => {
                if (playerState.allowShortcutsRef.current) {
                    playerActions.onProgress(playerState.progressSecondsRef.current - 7, 'manual-seek')
                }
            },
            onDown: () => {
                if (playerState.allowShortcutsRef.current) {
                    playerActions.setSubtitleFontSize(playerState.subtitleFontSize - 4)
                }
            },
            onUp: () => {
                if (playerState.allowShortcutsRef.current) {
                    const nextSubtitleColor = { ...playerState.subtitleColor }
                    nextSubtitleColor.shade -= 0.15
                    if (nextSubtitleColor.shade < 0) nextSubtitleColor.shade = 0.0
                    playerActions.setSubtitleColor(nextSubtitleColor)
                }
            },
        })
        return () => {
            removeActionListener('player-controls')
        }
    }, [addActionListener, removeActionListener])

    React.useEffect(() => {
        playerState.allowShortcutsRef.current =
            (!playerSnapshot.controlsVisible &&
                playerSnapshot.isReady &&
                !playerSnapshot.isTranscode &&
                playerSnapshot.initialSeekComplete) ||
            !playerSnapshot.initialSeekSeconds
    }, [
        playerSnapshot.controlsVisible,
        playerSnapshot.isReady,
        playerSnapshot.isTranscode,
        playerSnapshot.initialSeekComplete,
        playerSnapshot.initialSeekSeconds,
    ])

    React.useEffect(() => {
        playerState.progressSecondsRef.current = playerSnapshot.progressSeconds ?? 0
    }, [playerSnapshot.progressSeconds])

    React.useEffect(() => {
        if (!playerSnapshot.videoLoading && !playerSnapshot.manualSeekSeconds) {
            playerState.videoLoading = true
            if (playerSnapshot.currentRoute?.routeParams?.audioTrack) {
                playerState.audioTrackIndex = parseInt(playerSnapshot.currentRoute.routeParams.audioTrack, 10)
            }
            if (playerSnapshot.currentRoute?.routeParams?.subtitleTrack) {
                playerState.subtitleTrackIndex = parseInt(playerSnapshot.currentRoute.routeParams.subtitleTrack, 10)
            }
            if (playerSnapshot.isTranscode) {
                if (playerState.setupPayload?.loadTranscode) {
                    playerActions.onAddLog({
                        kind: 'snowstream',
                        message: 'firing off a loadTranscode',
                        routeParams: playerSnapshot.currentRoute.routeParams,
                    })
                    playerState
                        .setupPayload
                        .loadTranscode(
                            playerState.apiClient,
                            playerSnapshot.currentRoute.routeParams,
                            playerState.clientOptions.deviceProfile,
                            playerSnapshot.initialSeekSeconds
                        )
                        .then(playerActions.loadVideo.bind(playerActions))
                }
            } else {
                if (playerState.setupPayload?.loadVideo) {
                    playerActions.onAddLog({
                        kind: 'snowstream',
                        message: 'firing off a loadVideo',
                        routeParams: playerSnapshot.currentRoute.routeParams,
                    })
                    playerState
                        .setupPayload
                        .loadVideo(
                            playerState.apiClient,
                            playerSnapshot.currentRoute.routeParams,
                            playerState.clientOptions.deviceProfile
                        )
                        .then(playerActions.loadVideo.bind(playerActions))
                }
            }
        }
    }, [playerSnapshot.currentRoute, playerSnapshot.manualSeekSeconds, playerSnapshot.videoLoading, playerSnapshot.initialSeekSeconds])

    return props.children || null
}
