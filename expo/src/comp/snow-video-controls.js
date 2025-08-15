import React from 'react'
import { View } from 'react-native'
import { usePathname, useLocalSearchParams } from 'expo-router'

import Style from '../snow-style'
import { useAppContext } from '../app-context'
import { usePlayerContext } from '../player-context'

import FillView from './fill-view'
import SnowGrid from './snow-grid'
import SnowLabel from './snow-label'
import SnowModal from './snow-modal'
import SnowRangeSlider from './snow-range-slider'
import SnowTabs from './snow-tabs'
import SnowText from './snow-text';
import SnowTextButton from './snow-text-button'
import SnowTrackSelector from './snow-track-selector'


const styles = {
    background: {
        backgroundColor: Style.color.transparentDark,
        padding: 60
    },

    progress: {
        flexBasis: '100%',
        textAlign: 'center'
    },

    logs: {
        backgroundColor: Style.color.background,
        zIndex: Style.depth.video.controls + 10,
        elevation: Style.depth.video.controls + 10
    },
    prompt: {
        backgroundColor: Style.color.transparentDark,
        zIndex: Style.depth.video.controls,
        elevation: Style.depth.video.controls
    }
}

export default function SnowVideoControls(props) {
    const { apiClient, routes } = useAppContext()
    const localParams = useLocalSearchParams()
    const currentRoute = usePathname()
    const player = usePlayerContext()

    const [showLogs, setShowLogs] = React.useState(false)
    const [logTitle, setLogTitle] = React.useState(player.info.playerKind !== 'rnv' ? player.info.playerKind + ' Logs' : 'exo Logs')

    if (!player || !player.info.controlsVisible) {
        return null
    }

    if (showLogs) {
        return (
            <SnowModal
                style={styles.logs}
                onRequestClose={() => { setShowLogs(false) }}>
                <SnowGrid shrink itemsPerRow={1}>
                    <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                </SnowGrid>
                <FillView scroll>
                    <SnowGrid
                        itemsPerRow={1}
                        items={player.info.logs}
                        renderItem={(log) => { return <SnowText shrink>{log}</SnowText> }} />
                </FillView>
                <SnowGrid shrink itemsPerRow={1}>
                    <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                </SnowGrid>
            </SnowModal>
        )
    }

    const persistLogs = () => {
        apiClient.savePlaybackLogs(player.info.logs).then((response) => {
            setLogTitle(response.cache_key)
        })
    }

    let swapTitle = "Swap to mpv"
    if (player.info.playerKind === 'mpv') {
        swapTitle = 'Swap to exo'
    }

    let transcodeTitle = "Start Transcoding"
    if (player.info.isTranscode) {
        transcodeTitle = "Stop Transcoding"
    }

    let tabs = [
        'Playback'
    ]

    if (player.info.playerKind !== 'rnv') {
        tabs.push('Style')
    }

    if (player.info.mediaTracks) {
        tabs.push('Track')
    }

    tabs.push('Advanced')

    let subtitleControls = null
    if (player.info.playerKind !== 'rnv') {
        subtitleControls = (
            <SnowGrid itemsPerRow={4}>
                <SnowTextButton title="Sub Smaller" onPress={() => {
                    player.action.setSubtitleFontSize(fontSize => { return fontSize - 4 })
                }} />
                <SnowTextButton title="Sub Bigger" onPress={() => {
                    player.action.setSubtitleFontSize(fontSize => { return fontSize + 4 })
                }} />
                <SnowTextButton title="Sub Darker" onPress={() => {
                    player.action.setSubtitleColor(fontColor => {
                        newColor = { ...fontColor }
                        newColor.shade -= 0.15;
                        if (newColor.shade < 0) {
                            newColor.shade = 0.0
                        }
                        return newColor
                    })
                }} />
                <SnowTextButton title="Sub Lighter" onPress={() => {
                    player.action.setSubtitleColor(fontColor => {
                        newColor = { ...fontColor }
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
    if (player.info.mediaTracks) {
        trackControls = (
            <View>
                <SnowTrackSelector
                    style={styles.row}
                    showDelay={true}
                    audioDelay={player.info.audioDelaySeconds}
                    setAudioDelay={player.action.setAudioDelay}
                    subtitleDelay={player.info.subtitleDelaySeconds}
                    setSubtitleDelay={player.action.setSubtitleDelay}
                    tracks={player.info.mediaTracks}
                    selectTrack={player.action.onSelectTrack}
                    audioTrack={player.info.audioTrackIndex}
                    subtitleTrack={player.info.subtitleTrackIndex}
                />
            </View>
        )
    }
    let slider = null
    if (player.info.durationSeconds > 0) {
        const onPercentChange = (percent) => {
            player.action.onProgressDebounced(null, 'manual-seek', percent);
        }
        slider = (
            <View>
                <SnowRangeSlider
                    width={800}
                    percent={player.info.progressPercent ?? 0}
                    onValueChange={onPercentChange}
                />
                <SnowText style={styles.progress}>{player.info.progressDisplay ?? ''} / {player.info.durationDisplay}</SnowText>
            </View>
        )
    }

    return (
        (
            <SnowModal
                modalStyle={styles.prompt}
                style={styles.background}
                transparent
                visible={player.info.controlsVisible}
                onRequestClose={player.action.onResumeVideo}
            >
                <FillView flexStart scroll>
                    <SnowLabel center>{player.info.videoTitle}</SnowLabel>
                    {slider}
                    <SnowTabs headers={tabs}>
                        <View>
                            <SnowGrid itemsPerRow={3}>
                                <SnowTextButton shouldFocus={true} title="Resume" onPress={player.action.onResumeVideo} />
                                <SnowTextButton title="Stop" onPress={() => { player.action.onStopVideo() }} />
                                <SnowTextButton title="Home" onPress={() => { player.action.onStopVideo(true) }} />
                            </SnowGrid>
                        </View>
                        {subtitleControls}
                        {trackControls}
                        <SnowGrid short shrink itemsPerRow={2}>
                            <SnowTextButton title={logTitle} onPress={() => { setShowLogs(true) }} onLongPress={persistLogs} />
                            <SnowTextButton title={swapTitle} onPress={() => {
                                let newParams = { ...localParams }
                                newParams.forcePlayer = 'mpv'
                                if (player.info.playerKind === 'mpv') {
                                    newParams.forcePlayer = 'exo'
                                }
                                newParams.seekToSeconds = player.info.progressSeconds
                                routes.replace(currentRoute, newParams)
                            }} />
                            <SnowTextButton title={transcodeTitle} onPress={() => {
                                let newParams = { ...localParams }
                                newParams.transcode = !player.info.isTranscode
                                newParams.seekToSeconds = player.info.progressSeconds
                                routes.replace(currentRoute, newParams)
                            }} />
                        </SnowGrid>
                    </SnowTabs>
                </FillView>
            </SnowModal >
        )
    )
}