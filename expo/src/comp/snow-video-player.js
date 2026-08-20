import React from 'react'
import Snow from 'expo-snowui'
import {
    AppState,
    Platform,
    View
} from 'react-native'
import { useKeepAwake } from 'expo-keep-awake'
import Player from 'snowstream-player'
import util from '../util'
import SnowVideoControls from './snow-video-controls'
import { useAppContext } from '../app-context'

export default function SnowVideoPlayer(props) {
    const { pushModal, popModal, openOverlay, closeOverlay } = Snow.useLayerContext()
    const player = Player.useSnapshot(Player.state)

    const { config } = useAppContext()

    if (Platform.OS !== 'web') {
        useKeepAwake()
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                Player.action.onStopVideo()
            }
        })

        return () => {
            appStateSubscription.remove()
        }
    }, [])

    // Video View Modal
    React.useEffect(() => {
        if (player.settingsLoaded && player.videoUrl) {
            Player.action.onAddLog({ kind: 'snowstream', message: 'Showing video content modal' })
            pushModal({
                props: {
                    assignFocus: false,
                    onRequestClose: () => {
                        const current = Player.snapshot(Player.state)
                        if (!current.controlsVisible && !current.logsVisible) {
                            Player.action.onStopVideo()
                        }
                    }
                },
                render: () => {
                    const VideoView = Player.action.getVideoView()
                    if (player.clientOptions.nightFilter) {
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
                Player.action.onAddLog({ kind: 'snowstream', message: 'Closing video content modal' })
                popModal()
            }
        }
    }, [player.settingsLoaded, player.videoUrl])

    // Touch Overlay for Pause
    React.useEffect(() => {
        if (player.settingsLoaded && player.videoUrl && !player.controlsVisible) {
            Player.action.onAddLog({ kind: 'snowstream', message: 'Enabling video pause touch overlay' })
            openOverlay({
                props: {
                    canFocus: true,
                    focusStart: true,
                    boundary: 'video-player',
                    focusKey: 'video-player',
                    onPress: () => {
                        Player.action.onPauseVideo()
                    }
                }
            })

            return () => {
                closeOverlay()
            }
        } else {
            closeOverlay()
        }
    }, [player.controlsVisible, player.settingsLoaded, player.videoUrl])

    // Playback Controls Modal
    React.useEffect(() => {
        if (player.controlsVisible && player.settingsLoaded && player.videoUrl) {
            Player.action.onAddLog({ kind: 'snowstream', message: 'Showing playback controls modal' })
            pushModal({
                props: {
                    transparent: true,
                    boundary: 'video-controls',
                    scroll: true,
                    onRequestClose: () => {
                        Player.action.onResumeVideo()
                    }
                },
                render: (modalProps) => {
                    return <SnowVideoControls {...modalProps} />
                }
            })

            return () => {
                Player.action.onAddLog({ kind: 'snowstream', message: 'Closing playback controls.' })
                popModal()
            }
        }
    }, [player.controlsVisible, player.settingsLoaded, player.videoUrl])

    // Logs Modal
    React.useEffect(() => {
        if (player.logsVisible && player.settingsLoaded && player.videoUrl) {
            Player.action.onAddLog({ kind: 'snowstream', message: 'Opening video log viewer modal' })
            pushModal({
                props: {
                    black: true,
                    scroll: true,
                    onRequestClose: () => {
                        Player.action.setVideoLogsVisible(false)
                    }
                },
                render: () => {
                    return (
                        <Snow.Grid
                            focusStart
                            focusKey="log-entry"
                            itemsPerRow={1}
                            itemsPerPage={1}
                            items={player.logs}
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
                Player.action.onAddLog({ kind: 'snowstream', message: 'Closing video log viewer modal' })
                popModal()
            }
        }
    }, [player.logsVisible, player.settingsLoaded, player.videoUrl])

    if (config.debugVideoPlayer) {
        util.log(player.videoUrl)
    }

    return (
        <Snow.FillView>
            <Snow.Header center>{player.videoLoaded ? null : "Preparing the video."}</Snow.Header>
        </Snow.FillView>
    )
}