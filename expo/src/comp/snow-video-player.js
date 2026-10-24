import React from 'react'
import Snow from '@snowsuite/expo-snowui'
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

function VideoContent({ playerKind, clientOptions }) {
    const { useHubState } = Snow.useSnowContext()

    const videoUrl = useHubState((state) => state?.videoUrl)
    const playbackSettled = useHubState((state) => state?.playbackSettled)
    const rawMessages = useHubState((state) => state?.statusMessages)
    const videoTitle = useHubState((state) => state?.videoTitle)

    const statusMessages = rawMessages?.length > 0 ? rawMessages : ['Preparing the video']
    const VideoView = videoUrl ? resolveVideoView(playerKind) : null

    return (
        <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'black' }}>
            {VideoView ? <VideoView clientOptions={clientOptions} /> : null}
            {clientOptions?.nightFilter && VideoView ? (
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
            ) : null}
            {!playbackSettled && statusMessages.length > 0 ? (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'black',
                        padding: 32
                    }}
                >
                    {videoTitle ? (
                        <Snow.Header center style={{ marginBottom: 16 }}>
                            {videoTitle}
                        </Snow.Header>
                    ) : null}
                    <View style={{ alignItems: 'center' }}>
                        {statusMessages.map((msg, index) => {
                            const isLatest = index === statusMessages.length - 1
                            return (
                                <Snow.Text
                                    key={index}
                                    style={{
                                        fontSize: 15,
                                        opacity: isLatest ? 0.95 : 0.45,
                                        marginVertical: 2
                                    }}
                                >
                                    {msg}
                                </Snow.Text>
                            )
                        })}
                    </View>
                </View>
            ) : null}
        </View>
    )
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

    React.useEffect(() => {
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
                return <VideoContent playerKind={playerKind} clientOptions={clientOptions} />
            }
        })

        return () => {
            popModal()
        }
    }, [playerKind, clientOptions])

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

    return <View style={{ flex: 1, backgroundColor: 'black' }} />
}