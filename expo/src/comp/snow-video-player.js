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
    const { SnowStyle, getWindowHeight, getWindowWidth } = Snow.useStyleContext(props)
    const player = usePlayerContext()
    if (!player) {
        return null
    }
    const { config } = useAppContext()
    const VideoView = player.VideoView
    const styles = {
        videoOverlay: {
            backgroundColor: 'transparent',
            width: getWindowWidth(),
            height: getWindowHeight(),
        },
        videoView: {
            width: getWindowWidth(),
            height: getWindowHeight(),
            backgroundColor: SnowStyle.color.background,
        },
        videoControls: {
            flex: 1
        },
        dark: {
            backgroundColor: SnowStyle.color.background,
        }
    }

    React.useEffect(() => {
        return () => {
            player.action.onStopVideo()
        }
    }, [])

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

    if (!player.info.videoUrl) {
        return null
    }

    if (config.debugVideoPlayer) {
        util.log(player.info.videoUrl)
    }

    return (
        <View style={styles.dark}>
            {player.info.videoLoaded ? <VideoView /> : null}
            <SnowVideoControls playerKind={player.playerKind} />
        </View >
    )
}