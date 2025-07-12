import React from 'react'
import Slider from '@react-native-community/slider';
import { View } from 'react-native'

import util from '../util'
import Style from '../snow-style'
import { useAppContext } from '../app-context'

import FillView from './fill-view'
import SnowTrackSelector from './snow-track-selector'
import SnowText from './snow-text';
import SnowTextButton from './snow-text-button'
import SnowGrid from './snow-grid'
import SnowModal from './snow-modal'


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
    if (!props.controlsVisible) {
        return null
    }

    const { routes } = useAppContext()
    const [showLogs, setShowLogs] = React.useState(false)

    const progressPercent = 100 * (props.progressSeconds / props.durationSeconds)
    const progressDisplay = util.secondsToTimestamp(props.progressSeconds)
    const durationDisplay = util.secondsToTimestamp(props.durationSeconds)

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
                        items={props.logs}
                        renderItem={(log) => { return <SnowText shrink>{log}</SnowText> }} />
                </FillView>
                <SnowGrid shrink itemsPerRow={1}>
                    <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                </SnowGrid>
            </SnowModal>
        )
    }
    return (
        (
            <SnowModal
                modalStyle={styles.prompt}
                style={styles.background}
                transparent
                visible={props.controlsVisible}
                onRequestClose={props.resumeVideo}
            >
                <SnowText>{props.videoTitle}</SnowText>
                <Slider
                    minimumValue={0}
                    maximumValue={100}
                    value={progressPercent}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#cccccc"
                    onSlidingComplete={props.onSeek}
                    onValueChange={props.onSeek}
                />
                <SnowText style={styles.progress}>{progressDisplay} / {durationDisplay}</SnowText>
                <SnowGrid itemsPerRow={4}>
                    <SnowTextButton shouldFocus={true} title="Resume" onPress={props.resumeVideo} />
                    <SnowTextButton title="Logs" onPress={() => { setShowLogs(true) }} />
                    <SnowTextButton title="Stop" onPress={() => { props.stopVideo() }} />
                    <SnowTextButton title="Home" onPress={() => { props.stopVideo(true) }} />
                </SnowGrid>
                <SnowGrid itemsPerRow={4}>
                    <SnowTextButton title="Sub Smaller" onPress={() => {
                        props.setSubtitleFontSize(fontSize => { return fontSize - 4 })
                    }} />
                    <SnowTextButton title="Sub Bigger" onPress={() => {
                        props.setSubtitleFontSize(fontSize => { return fontSize + 4 })
                    }} />
                    <SnowTextButton title="Sub Darker" onPress={() => {
                        props.setSubtitleColor(fontColor => {
                            newColor = { ...fontColor }
                            newColor.shade -= 0.15;
                            if (newColor.shade < 0) {
                                newColor.shade = 0.0
                            }
                            return newColor
                        })
                    }} />
                    <SnowTextButton title="Sub Lighter" onPress={() => {
                        props.setSubtitleColor(fontColor => {
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
                <SnowTrackSelector
                    style={styles.row}
                    tracks={props.tracks}
                    selectTrack={props.selectTrack}
                    audioTrack={props.audioTrack}
                    subtitleTrack={props.subtitleTrack}
                />
            </SnowModal >
        )
    )
}