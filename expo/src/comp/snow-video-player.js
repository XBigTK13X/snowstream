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
    const { pushModal, popModal, enableOverlay, disableOverlay } = Snow.useLayerContext()
    const player = Player.useSnapshot(Player.state)

    if (!player) {
        return null
    }
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

    React.useEffect(() => {
        if (player?.info?.videoUrl) {
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
            if (player.controlsVisible) {
                enableOverlay({
                    props: {
                        focusStart,
                        focusKey: "video-player",
                        focusLayer: "video-player",
                        onPress: Player.action.onPauseVideo
                    }
                })
            } else {
                disableOverlay()
            }

            return () => {
                popModal()
                disableOverlay()
            }
        }
    }, [player.videoUrl])
    React.useEffect(() => {
        if (player?.info?.controlsVisible) {
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
                    return <SnowVideoControls playerKind={player?.playerKind} />
                }
            })
            return () => {
                popModal()
            }
        }
    }, [player.controlsVisible])

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