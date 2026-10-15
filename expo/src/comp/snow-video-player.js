import React from 'react'
import Snow from 'expo-snowui'
import {
    AppState,
    Platform,
    View
} from 'react-native'
import { useKeepAwake } from 'expo-keep-awake'
import util from '../util'
import SnowVideoControls from './snow-video-controls'
import { useAppContext } from '../app-context'
import { playerSelectors } from '../player/player-envelope'

function resolveVideoView(kind) {
    if (kind === 'null') {
        return require('../comp/null-video-view').default
    }
    if (kind === 'rnv') {
        return require('../comp/rnv-video-view').default
    }
    return require('../comp/mpv-video-view').default
}

export default function SnowVideoPlayer(props) {
    const {
        pushModal,
        popModal,
        openOverlay,
        closeOverlay,
        envelope,
        getEnvelope,
        updateEnvelope,
        currentRoute,
        actions
    } = Snow.useSnowContext()

    const { config, clientOptions } = useAppContext()
    const routeParams = currentRoute?.routeParams || {}

    const playerKind = playerSelectors.playerKind(envelope, routeParams, clientOptions)

    if (Platform.OS !== 'web') {
        useKeepAwake()
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                actions?.onStopVideo?.()
            }
        })

        return () => {
            appStateSubscription.remove()
        }
    }, [actions])

    // Video View Modal
    React.useEffect(() => {
        if (envelope?.videoUrl) {
            actions?.addLog?.({ kind: 'snowstream', message: 'Showing video content modal' })
            pushModal({
                props: {
                    assignFocus: false,
                    onRequestClose: () => {
                        const current = getEnvelope()
                        if (!current?.controlsVisible && !current?.logsVisible) {
                            actions?.onStopVideo?.()
                        }
                    }
                },
                render: () => {
                    const VideoView = resolveVideoView(playerKind)
                    if (clientOptions?.nightFilter) {
                        return (
                            <>
                                <VideoView />
                                <View style={{
                                    flex: 1,
                                    backgroundColor: 'rgb(10, 10, 25)',
                                    opacity: 0.45
                                }} />
                            </>
                        )
                    }
                    return <VideoView />
                }
            })

            return () => {
                actions?.addLog?.({ kind: 'snowstream', message: 'Closing video content modal' })
                popModal()
            }
        }
    }, [envelope?.videoUrl, playerKind, clientOptions?.nightFilter])

    // Touch Overlay for Pause
    React.useEffect(() => {
        // Only mount touch overlay when video is actively ready and playing
        if (envelope?.videoUrl && envelope?.isVideoViewReady && envelope?.isPlaying && !envelope?.controlsVisible) {
            openOverlay({
                props: {
                    canFocus: true,
                    focusStart: true,
                    boundary: 'video-player',
                    focusKey: 'video-player',
                    onPress: () => {
                        actions?.onPauseVideo?.()
                    }
                }
            })

            return () => {
                closeOverlay()
            }
        } else {
            closeOverlay()
        }
    }, [envelope?.controlsVisible, envelope?.videoUrl, envelope?.isVideoViewReady, envelope?.isPlaying])

    // Playback Controls Modal
    React.useEffect(() => {
        if (envelope?.controlsVisible && envelope?.videoUrl) {
            actions?.addLog?.({ kind: 'snowstream', message: 'Showing playback controls modal' })
            pushModal({
                props: {
                    transparent: true,
                    boundary: 'video-controls',
                    scroll: true,
                    onRequestClose: () => {
                        actions?.onResumeVideo?.()
                    }
                },
                render: (modalProps) => {
                    return <SnowVideoControls {...modalProps} actions={actions} />
                }
            })

            return () => {
                actions?.addLog?.({ kind: 'snowstream', message: 'Closing playback controls.' })
                popModal()
            }
        }
    }, [envelope?.controlsVisible, envelope?.videoUrl])

    // Logs Modal
    React.useEffect(() => {
        if (envelope?.logsVisible && envelope?.videoUrl) {
            actions?.addLog?.({ kind: 'snowstream', message: 'Opening video log viewer modal' })
            pushModal({
                props: {
                    black: true,
                    scroll: true,
                    onRequestClose: () => {
                        updateEnvelope({ logsVisible: false })
                    }
                },
                render: () => {
                    return (
                        <Snow.Grid
                            focusStart
                            focusKey="log-entry"
                            itemsPerRow={1}
                            itemsPerPage={1}
                            items={envelope?.logs || []}
                            renderItem={(log) => {
                                return (
                                    <Snow.View>
                                        <Snow.Target />
                                        <Snow.Text shrink>{log}</Snow.Text>
                                    </Snow.View>
                                )
                            }} />
                    )
                }
            })
            return () => {
                actions?.addLog?.({ kind: 'snowstream', message: 'Closing video log viewer modal' })
                popModal()
            }
        }
    }, [envelope?.logsVisible, envelope?.videoUrl, envelope?.logs])

    if (config?.debugVideoPlayer) {
        util.log(envelope?.videoUrl)
    }

    return (
        <Snow.FillView>
            <Snow.Header center>{envelope?.videoLoaded ? null : "Preparing the video."}</Snow.Header>
        </Snow.FillView>
    )
}