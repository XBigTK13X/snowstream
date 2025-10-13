import React from 'react'
import Snow from 'expo-snowui'
import {
    AppState,
    Platform,
    View
} from 'react-native'
import { useKeepAwake } from 'expo-keep-awake';

import util from '../util'
import SnowVideoControls from './snow-video-controls'
import { usePlayerContext } from '../player-context'
import { useAppContext } from '../app-context'

export default function SnowVideoPlayer(props) {
    const { pushModal, popModal, enableOverlay, disableOverlay } = Snow.useLayerContext()
    const player = usePlayerContext()
    if (!player) {
        return null
    }
    const { config } = useAppContext()

    if (!props.skipCleanup) {
        React.useEffect(() => {
            return () => {
                player.action.onStopVideo()
            }
        }, [])
    }

    if (Platform.OS !== 'web') {
        useKeepAwake();
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                player.action.onStopVideo()
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
                        player.action.onStopVideo()

                    }
                },
                render: () => {
                    const VideoView = player.VideoView
                    return <VideoView />
                }
            })
            if (player.info.controlsVisible) {
                enableOverlay({
                    props: {
                        focusStart,
                        focusKey: "video-player",
                        focusLayer: "video-player",
                        onPress: player.action.onPauseVideo
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
    }, [player.info.videoUrl])
    React.useEffect(() => {
        if (player?.info?.controlsVisible) {
            pushModal({
                props: {
                    focusLayer: 'video-controls',
                    obscure: true,
                    onRequestClose: () => {
                        popModal()
                        player.action.onResumeVideo()
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
    }, [player.info.controlsVisible])

    if (!player.info.videoUrl) {
        return null
    }

    if (config.debugVideoPlayer) {
        util.log(player.info.videoUrl)
    }

    return (
        <Snow.Text>Preparing the video player.</Snow.Text>
    )
}