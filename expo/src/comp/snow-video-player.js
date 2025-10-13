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
    const { SnowStyle, getWindowHeight, getWindowWidth } = Snow.useSnowContext(props)
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
        showModal({
            render: () => {
                const VideoView = player.VideoView
                return (
                    <Snow.FillView style={{ backgroundColor: 'black' }} >
                        <VideoView />
                        {player.info.controlsVisible ? <SnowVideoControls playerKind={player.playerKind} /> : null}
                    </Snow.FillView>
                )
            },
            props: {
                wrapper: false,
                assignFocus: false,
                onRequestClose: () => {
                    player.action.onStopVideo()

                }
            }
        })
        enableOverlay({
            props: {
                focusStart,
                focusKey: "video-player",
                focusLayer: "video-player",
                onPress: player.action.onPauseVideo
            }
        })
        return () => {
            hideModal()
            disableOverlay()
        }
    }, [videoUrl])

    if (!player.info.videoUrl) {
        return null
    }

    if (config.debugVideoPlayer) {
        util.log(player.info.videoUrl)
    }

    return (
        <View />
    )
}