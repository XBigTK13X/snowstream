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
        if (player.videoUrl) {
            pushModal({
                props: {
                    assignFocus: false,
                    onRequestClose: () => {
                        Player.action.onStopVideo()

                    }
                },
                render: () => {
                    const VideoView = player.VideoView
                    return <VideoView />
                }
            })
            if (!player.controlsVisible) {
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
    }, [player.videoUrl, player.controlsVisible])

    // Video controls
    React.useEffect(() => {
        if (player.videoUrl && player.controlsVisible) {
            pushModal({
                props: {
                    focusLayer: 'video-controls',
                    obscure: true,
                    onRequestClose: () => {
                        popModal()
                        Player.action.onResumeVideo()
                    }
                },
                render: () => {
                    // TODO prop no longer needed
                    return <SnowVideoControls playerKind={player.playerKind} />
                }
            })
            closeOverlay()
            return () => {
                openOverlay()
                popModal()
            }
        }
    }, [player.controlsVisible, player.videoUrl])

    if (!player.videoUrl) {
        return null
    }

    if (config.debugVideoPlayer) {
        util.log(player.videoUrl)
    }

    return (
        <Snow.Text>Preparing the video player.</Snow.Text>
    )
}