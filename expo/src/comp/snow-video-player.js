import React from 'react'
import Snow from 'expo-snowui'
import {
    AppState,
    Platform,
    View
} from 'react-native'
import { useKeepAwake } from 'expo-keep-awake';
import { Player } from 'snowstream'
import util from '../util'
import SnowVideoControls from './snow-video-controls'
import { useAppContext } from '../app-context'

export default function SnowVideoPlayer(props) {
    const { pushModal, popModal, openOverlay, closeOverlay } = Snow.useLayerContext()
    const player = Player.useSnapshot(Player.state)

    const { config } = useAppContext()

    if (Platform.OS !== 'web') {
        useKeepAwake();
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                Player.action.onStopVideo()
            }
        });

        return () => {
            appStateSubscription.remove();
        };
    }, []);

    // Video content / player
    React.useEffect(() => {
        if (player.settingsLoaded && player.videoUrl) {
            pushModal({
                props: {
                    assignFocus: false,
                    onRequestClose: () => {
                        const player = Player.snapshot(Player.state)
                        const shouldClose = !player.controlsVisible && !player.logsVisible
                        if (shouldClose) {
                            Player.action.onVideoModalBack()
                        }
                        if (props.onRequestCloseModal) {
                            props.onRequestCloseModal()
                        }
                    }
                },
                render: () => {
                    const playerSnapshot = Player.snapshot(Player.state)
                    const VideoView = playerSnapshot.VideoView
                    return <VideoView />
                }
            })
            if (!player.controlsVisible && player.isVideoViewReady) {
                openOverlay({
                    props: {
                        focusStart: true,
                        focusKey: "video-player",
                        focusLayer: "video-player",
                        onPress: Player.action.onPauseVideo
                    }
                })
            }

            return () => {
                popModal()
                closeOverlay()
            }
        }
    }, [player.controlsVisible, player.settingsLoaded, player.videoUrl, player.isVideoViewReady])

    // Video controls
    React.useEffect(() => {
        if (player.controlsVisible && player.settingsLoaded && player.videoUrl) {
            pushModal({
                props: {
                    focusLayer: 'video-controls',
                    obscure: true,
                    scroll: true,
                    onRequestClose: () => {
                        const player = Player.snapshot(Player.state)
                        const shouldClose = player.controlsVisible && !player.logsVisible
                        if (shouldClose) {
                            Player.action.onResumeVideo()
                        }
                    }
                },
                render: () => {
                    return <SnowVideoControls />
                }
            })
            closeOverlay()
            return () => {
                openOverlay()
                popModal()
            }
        }
    }, [player.controlsVisible, player.settingsLoaded, player.videoUrl])

    // Video logs
    React.useEffect(() => {
        if (player.logsVisible && player.settingsLoaded && player.videoUrl) {
            pushModal({
                props: {
                    focusLayer: 'video-logs',
                    black: true,
                    scroll: true,
                    onRequestClose: () => {
                        const player = Player.snapshot(Player.state)
                        if (player.logsVisible) {
                            Player.action.setVideoLogsVisible(false)
                        }
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
                popModal()
            }
        }
    }, [player.logsVisible, player.settingsLoaded, player.videoUrl])

    if (config.debugVideoPlayer) {
        util.log(player.videoUrl)
    }

    return (
        <Snow.FillView>
            <Snow.Header center>Preparing the video.</Snow.Header>
        </Snow.FillView>
    )
}