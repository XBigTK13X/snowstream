import React from 'react'
import util from '../util'
import {
    AppState,
    Platform,
    View
} from 'react-native'
import { useKeepAwake } from 'expo-keep-awake';
import Style from '../snow-style'
import SnowVideoControls from './snow-video-controls'
import { usePlayerContext } from '../player-context'
import { useAppContext } from '../app-context'

export default function SnowVideoPlayer(props) {
    const { config } = useAppContext()
    const player = usePlayerContext()
    const styles = {
        videoOverlay: {
            backgroundColor: 'transparent',
            width: Style.window.width(),
            height: Style.window.height(),
        },
        videoView: {
            width: Style.window.width(),
            height: Style.window.height(),
            backgroundColor: Style.color.background,
        },
        videoControls: {
            flex: 1
        },
        dark: {
            backgroundColor: Style.color.background,
        }
    }

    useKeepAwake();

    let VideoView = null
    let playerKind = null
    if (config.useNullVideoView) {
        VideoView = require('./null-video-view').default
        playerKind = 'null'
    }
    else {
        if (Platform.OS === 'web' || player.info.forceExoPlayer) {
            VideoView = require('./rnv-video-view').default
            playerKind = 'rnv'
        }
        else {
            VideoView = require('./mpv-video-view').default
            playerKind = 'mpv'
        }
    }

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', appState => {
            if (appState === 'background') {
                stopVideo()
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
            <VideoView />
            <SnowVideoControls playerKind={playerKind} />
        </View >
    )
}