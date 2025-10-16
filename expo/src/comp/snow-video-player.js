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

    if (!props.skipCleanup) {
        React.useEffect(() => {
            return () => {
                Player.action.onStopVideo()
            }
        }, [])
    }

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
        console.log({ settings: player.settingsLoaded })
        if (player.settingsLoaded && player.videoUrl) {
            pushModal({
                props: {
                    assignFocus: false,
                    onRequestClose: () => {
                        Player.action.onVideoModalBack()
                    }
                },
                render: () => {
                    const VideoView = player.VideoView
                    console.log({ video: player.videoWidth, video2: player.videoHeight })
                    return <VideoView />
                }
            })
            console.log({
                controlsVisible: player.controlsVisible,
                isVideoViewReady: player.isVideoViewReady
            })
            if (!player.controlsVisible && player.isVideoViewReady) {
                console.log("Video overlay enabled")
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
                console.log("Video overlay disabled")
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
                        popModal()
                        Player.action.onResumeVideo()
                    }
                },
                render: () => {
                    return <SnowVideoControls />
                }
            })
            closeOverlay()
            console.log("video controls - Overlay disabled")
            return () => {
                openOverlay()
                console.log("video controls - Overlay enabled")
                popModal()
            }
        }
    }, [player.controlsVisible, player.settingsLoaded, player.videoUrl])

    // Video logs
    React.useEffect(() => {
        if (player.logsVisible && player.settingsLoaded && player.videoUrl) {
            console.log("video logs - show modal")
            pushModal({
                props: {
                    focusLayer: 'video-logs',
                    black: true,
                    scroll: true,
                    onRequestClose: () => {
                        popModal()
                    }
                },
                render: () => {
                    return (
                        <>
                            <Snow.TextButton
                                focusStart
                                focusKey="close-top"
                                focusDown="log-entry"
                                title="Close Logs"
                                onPress={() => { Player.action.setShowVideoLogs(false) }} />
                            <Snow.Grid
                                scroll={true}
                                focusKey="log-entry"
                                focusDown="close-bottom"
                                itemsPerRow={1}
                                items={player.logs}
                                renderItem={(log) => {
                                    return (
                                        <Snow.View>
                                            <Snow.Target />
                                            <Snow.Text shrink>{log}</Snow.Text>
                                        </Snow.View>
                                    )
                                }} />
                            <Snow.TextButton
                                focusKey="close-bottom"
                                title="Close Logs"
                                onPress={() => { Player.action.setShowVideoLogs(false) }} />
                        </>
                    )
                }
            })
            return () => {
                console.log("video logs - close modal")
                popModal()
            }
        }
    }, [player.logsVisible, player.settingsLoaded, player.videoUrl])

    if (config.debugVideoPlayer) {
        util.log(player.videoUrl)
    }

    return (
        <Snow.Text>Preparing the video player.</Snow.Text>
    )
}