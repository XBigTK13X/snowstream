import React from 'react'
import Slider from '@react-native-community/slider';
import { View } from 'react-native'
import { usePathname, useLocalSearchParams } from 'expo-router'

import Style from '../snow-style'
import { useAppContext } from '../app-context'
import { usePlayerContext } from '../player-context'

import FillView from './fill-view'
import SnowTrackSelector from './snow-track-selector'
import SnowText from './snow-text';
import SnowTextButton from './snow-text-button'
import SnowGrid from './snow-grid'
import SnowModal from './snow-modal'
import SnowTabs from './snow-tabs'


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
    const player = usePlayerContext()
    if (!player.info.controlsVisible) {
        return null
    }

    const { apiClient, routes } = useAppContext()
    const localParams = useLocalSearchParams()
    const currentRoute = usePathname()
    const [showLogs, setShowLogs] = React.useState(false)
    const [logTitle, setLogTitle] = React.useState(props.playerKind !== 'rnv' ? props.playerKind + ' Logs' : 'exo Logs')

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
    if (props.playerKind === 'mpv') {
        swapTitle = 'Swap to exo'
    }

    const tabs = [
        'Playback',
        'Style',
        'Track',
        'Advanced'
    ]

    let subtitleControls = null
    if (props.playerKind !== 'rnv') {
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

    return (
        (
            <SnowModal
                modalStyle={styles.prompt}
                style={styles.background}
                transparent
                visible={player.info.controlsVisible}
                onRequestClose={player.action.resumeVideo}
            >
                <FillView flexStart scroll>
                    {player.info.durationSeconds > 0 ?
                        <View>
                            <SnowText>{player.info.videoTitle}</SnowText>
                            <Slider
                                minimumValue={0}
                                maximumValue={100}
                                value={player.info.progressPercent}
                                minimumTrackTintColor="#FFFFFF"
                                maximumTrackTintColor="#cccccc"
                                onSlidingComplete={() => { player.action.onProgressDebounced(player.info.progressPercent) }}
                                onValueChange={() => { player.action.onProgressDebounced(player.info.progressSeconds) }}
                            />
                            <SnowText style={styles.progress}>{progressDisplay} / {durationDisplay}</SnowText>
                        </View>
                        : null}
                    <SnowTabs headers={tabs}>
                        <View>
                            <SnowGrid itemsPerRow={3}>
                                <SnowTextButton shouldFocus={true} title="Resume" onPress={props.resumeVideo} />
                                <SnowTextButton title="Stop" onPress={() => { player.action.stopVideo() }} />
                                <SnowTextButton title="Home" onPress={() => { player.action.stopVideo(true) }} />
                            </SnowGrid>
                        </View>
                        {subtitleControls}
                        <View>
                            <SnowTrackSelector
                                style={styles.row}
                                showDelay={true}
                                audioDelay={player.info.audioDelaySeconds}
                                setAudioDelay={player.action.setAudioDelay}
                                subtitleDelay={player.info.subtitleDelaySeconds}
                                setSubtitleDelay={player.action.setSubtitleDelay}
                                tracks={player.info.tracks}
                                selectTrack={player.action.selectTrack}
                                audioTrack={player.info.audioTrackIndex}
                                subtitleTrack={player.info.subtitleTrackIndex}
                            />
                        </View>
                        <SnowGrid short shrink itemsPerRow={2}>
                            <SnowTextButton title={logTitle} onPress={() => { setShowLogs(true) }} onLongPress={persistLogs} />
                            <SnowTextButton title={swapTitle} onPress={() => {
                                let newParams = { ...localParams }
                                newParams.forcePlayer = 'mpv'
                                if (props.playerKind === 'mpv') {
                                    newParams.forcePlayer = 'exo'
                                }
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