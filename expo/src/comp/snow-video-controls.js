import React from 'react'
import Snow, {
    SnowFillView,
    SnowGrid,
    SnowLabel,
    SnowRangeSlider,
    SnowTabs,
    SnowText,
    SnowTextButton,
    SnowView,
    SnowTarget
} from 'expo-snowui'

import { useAppContext } from '../app-context'
import { Player } from 'snowstream'
import SnowTrackSelector from './snow-track-selector'

export default function SnowVideoControls(props) {
    const { SnowStyle } = Snow.useSnowContext(props)
    const styles = {
        background: {
            backgroundColor: SnowStyle.color.transparentDark,
            padding: 60
        },

        progress: {
            flexBasis: '100%',
            textAlign: 'center',
            fontWeight: 'bold',
        },
        logs: {
            backgroundColor: SnowStyle.color.background
        },
        prompt: {
            backgroundColor: SnowStyle.color.transparentDark
        }
    }
    const { apiClient, currentRoute } = useAppContext()
    const player = Player.useSnapshot(Player.state)

    const playerKind = player.playerKind

    const [showLogs, setShowLogs] = React.useState(false)
    const [logTitle, setLogTitle] = React.useState(playerKind !== 'rnv' ? playerKind + ' Logs' : 'exo Logs')

    const persistLogs = () => {
        apiClient.savePlaybackLogs(player.logs).then((response) => {
            setLogTitle(response.cache_key)
        })
    }

    let modalClose = null
    if (showLogs) {
        modalClose = () => { setShowLogs(false) }
        modalContent = (
            <SnowFillView>
                <SnowGrid focusStart focusKey="close-top" focusDown="log-entry" itemsPerRow={1}>
                    <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                </SnowGrid>
                <SnowFillView scroll>
                    <SnowGrid
                        focusKey="log-entry"
                        focusDown="close-bottom"
                        itemsPerRow={1}
                        items={player.logs}
                        renderItem={(log) => {
                            return (
                                <SnowView>
                                    <SnowText shrink>{log}</SnowText>
                                    <SnowTarget />
                                </SnowView>
                            )
                        }} />
                </SnowFillView>
                <SnowGrid focusKey="close-bottom" itemsPerRow={1}>
                    <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                </SnowGrid>
            </SnowFillView>
        )
    }
    let swapTitle = "Swap to mpv"
    if (playerKind === 'mpv') {
        swapTitle = 'Swap to exo'
    }

    let transcodeTitle = "Start Transcoding"
    if (player.isTranscode) {
        transcodeTitle = "Stop Transcoding"
    }

    let tabs = [
        'Playback'
    ]

    if (playerKind !== 'rnv') {
        tabs.push('Style')
    }

    if (player.mediaTracks) {
        tabs.push('Track')
    }

    tabs.push('Advanced')

    let subtitleControls = null
    if (playerKind !== 'rnv') {
        subtitleControls = (
            <SnowGrid itemsPerRow={4}>
                <SnowTextButton title="Sub Smaller" onPress={() => {
                    Player.action.setSubtitleFontSize(fontSize => { return fontSize - 4 })
                }} />
                <SnowTextButton title="Sub Bigger" onPress={() => {
                    Player.action.setSubtitleFontSize(fontSize => { return fontSize + 4 })
                }} />
                <SnowTextButton title="Sub Darker" onPress={() => {
                    Player.action.setSubtitleColor(fontColor => {
                        let newColor = { ...fontColor }
                        newColor.shade -= 0.15;
                        if (newColor.shade < 0) {
                            newColor.shade = 0.0
                        }
                        return newColor
                    })
                }} />
                <SnowTextButton title="Sub Lighter" onPress={() => {
                    Player.action.setSubtitleColor(fontColor => {
                        let newColor = { ...fontColor }
                        newColor.shade += 0.15;
                        if (newColor.shade > 1.0) {
                            newColor.shade = 1.0
                        }
                        return newColor
                    })
                }}
                />
            </SnowGrid>
        )
    }
    let trackControls = null
    if (player.mediaTracks) {
        trackControls = (
            <SnowTrackSelector
                focusKey="track-selector"
                style={styles.row}
                showDelay={true}
                audioDelay={player.audioDelaySeconds}
                setAudioDelay={Player.action.setAudioDelay}
                subtitleDelay={player.subtitleDelaySeconds}
                setSubtitleDelay={Player.action.setSubtitleDelay}
                tracks={player.mediaTracks}
                selectTrack={Player.action.onSelectTrack}
                audioTrack={player.audioTrackIndex}
                subtitleTrack={player.subtitleTrackIndex}
            />
        )
    }
    let slider = null
    if (player.durationSeconds > 0) {
        const onPercentChange = (percent) => {
            Player.action.onProgress(null, 'manual-seek', percent);
        }
        slider = (
            <>
                <SnowRangeSlider
                    focusKey="seekbar"
                    focusDown="control-tabs"
                    width={750}
                    debounce={true}
                    percent={player.progressPercent ?? 0}
                    onValueChange={onPercentChange}
                />
                <SnowText style={styles.progress}>{player.progressDisplay ?? ''} / {player.durationDisplay}</SnowText>
            </>
        )
    }

    return (
        (
            <SnowFillView style={{ position: 'absolute', right: 0, left: 0, top: 0, bottom: 0 }} flexStart scroll>
                <SnowLabel center>{player.videoTitle}</SnowLabel>
                {slider}
                <SnowTabs focusStart focusKey="control-tabs" headers={tabs}>
                    <SnowGrid itemsPerRow={3}>
                        <SnowTextButton title="Resume" onPress={Player.action.onResumeVideo} />
                        <SnowTextButton title="Stop" onPress={() => { Player.action.onStopVideo() }} />
                        <SnowTextButton title="Home" onPress={() => { Player.action.onStopVideo(true) }} />
                    </SnowGrid>
                    {subtitleControls}
                    {trackControls}
                    <SnowGrid short itemsPerRow={2}>
                        <SnowTextButton title={logTitle} onPress={() => { setShowLogs(true) }} onLongPress={persistLogs} />
                        <SnowTextButton title={swapTitle} onPress={() => {
                            let newParams = { ...currentRoute.routeParams }
                            newParams.forcePlayer = 'mpv'
                            if (playerKind === 'mpv') {
                                newParams.forcePlayer = 'exo'
                            }
                            newParams.seekToSeconds = player.progressSeconds
                            Player.action.onChangeRouteParams(newParams)
                        }} />
                        <SnowTextButton title={transcodeTitle} onPress={() => {
                            let newParams = { ...currentRoute.routeParams }
                            newParams.transcode = !player.isTranscode
                            newParams.seekToSeconds = player.progressSeconds
                            Player.action.onChangeRouteParams(newParams)
                        }} />
                    </SnowGrid>
                </SnowTabs>
            </SnowFillView>
        )
    )
}