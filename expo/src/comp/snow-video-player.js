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

function resolveVideoView(kind) {
    if (kind === 'web') {
        return require('./video/web-video-view').default
    }
    if (kind === 'null') {
        return require('./video/null-video-view').default
    }
    if (kind === 'exo') {
        return require('./video/exo-video-view').default
    }
    return require('./video/mpv-video-view').default
}

export default function SnowVideoPlayer(props) {
    const {
        pushModal,
        popModal,
        openOverlay,
        closeOverlay,
        getHubState,
        sendHubData,
        emitHubEvent,
        useHubState
    } = Snow.useSnowContext()

    const { apiClient, config, clientOptions } = useAppContext()

    const videoUrl = useHubState((state) => state?.videoUrl)
    const videoLoaded = useHubState((state) => state?.videoLoaded)
    const isVideoViewReady = useHubState((state) => state?.isVideoViewReady)
    const isPlaying = useHubState((state) => state?.isPlaying)
    const controlsVisible = useHubState((state) => state?.controlsVisible)
    const logsVisible = useHubState((state) => state?.logsVisible)

    const hubPlayerKind = useHubState((state) => state?.playerKind)
    const playerKind = Platform.OS === 'web' ? 'web' : (hubPlayerKind || 'mpv')

    if (Platform.OS !== 'web') {
        useKeepAwake()
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', (appState) => {
            if (appState === 'background') {
                emitHubEvent('player.stop')
            }
        })

        return () => {
            appStateSubscription.remove()
        }
    }, [emitHubEvent])

    React.useEffect(() => {
        if (controlsVisible && isPlaying) {
            emitHubEvent('player.pause')
        }
    }, [controlsVisible, isPlaying, emitHubEvent])

    // Video content
    React.useEffect(() => {
        if (videoUrl) {
            pushModal({
                props: {
                    assignFocus: false,
                    onRequestClose: () => {
                        const current = getHubState()
                        if (!current?.controlsVisible && !current?.logsVisible) {
                            emitHubEvent('player.stop')
                        }
                    }
                },
                render: () => {
                    const VideoView = resolveVideoView(playerKind)
                    if (clientOptions?.nightFilter) {
                        return (
                            <>
                                <VideoView clientOptions={clientOptions} />
                                <View
                                    pointerEvents="none"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgb(10, 10, 25)',
                                        opacity: 0.45
                                    }}
                                />
                            </>
                        )
                    }
                    return <VideoView clientOptions={clientOptions} />
                }
            })

            return () => {
                popModal()
            }
        }
    }, [videoUrl, playerKind, clientOptions])

    // Input overlay
    React.useEffect(() => {
        if (videoUrl && isVideoViewReady && isPlaying && !controlsVisible) {
            openOverlay({
                props: {
                    canFocus: true,
                    focusStart: true,
                    boundary: 'video-player',
                    focusKey: 'video-player',
                    onPress: () => {
                        emitHubEvent('player.pause')
                    }
                }
            })

            return () => {
                closeOverlay()
            }
        } else {
            closeOverlay()
        }
    }, [videoUrl, isVideoViewReady, isPlaying, controlsVisible])


    // Controls GUI
    React.useEffect(() => {
        if (controlsVisible && videoUrl) {
            pushModal({
                props: {
                    transparent: true,
                    boundary: 'video-controls',
                    scroll: true,
                    onRequestClose: () => {
                        emitHubEvent('player.resume')
                    }
                },
                render: (modalProps) => {
                    return <SnowVideoControls {...modalProps} apiClient={apiClient} />
                }
            })

            return () => {
                popModal()
            }
        }
    }, [controlsVisible, videoUrl, apiClient])

    // Logs GUI

    React.useEffect(() => {
        if (logsVisible && videoUrl) {
            const currentLogs = getHubState().logs || []
            pushModal({
                props: {
                    black: true,
                    scroll: true,
                    onRequestClose: () => {
                        sendHubData({ logsVisible: false }, 'player.logsClosed')
                    }
                },
                render: () => {
                    return (
                        <Snow.Grid
                            focusStart
                            focusKey="log-entry"
                            itemsPerRow={1}
                            itemsPerPage={1}
                            items={currentLogs}
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
                popModal()
            }
        }
    }, [logsVisible, videoUrl])

    if (config?.debugVideoPlayer) {
        util.log(videoUrl)
    }

    return (
        <Snow.FillView>
            <Snow.Header center>{videoLoaded ? null : "Preparing the video."}</Snow.Header>
        </Snow.FillView>
    )
}