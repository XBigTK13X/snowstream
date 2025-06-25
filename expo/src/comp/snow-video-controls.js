import React from 'react'
import { Modal, View } from 'react-native'
import Slider from '@react-native-community/slider';

import util from '../util'
import { StaticStyle } from '../snow-style'
import { useAppContext } from '../app-context'

import FillView from './fill-view'
import SnowTrackSelector from './snow-track-selector'
import SnowText from './snow-text';
import SnowTextButton from './snow-text-button'
import SnowGrid from './snow-grid'


const styles = {
    background: {
        backgroundColor: StaticStyle.color.transparentDark,
        padding: 60
    },

    row: {
        flexBasis: '100%'
    },

    columns: {
        flexBasis: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 80
    },

    column: {
        flex: 1
    },

    progress: {
        flexBasis: '100%',
        textAlign: 'center'
    },

    prompt: {
        backgroundColor: StaticStyle.color.background
    }
}

export default function SnowVideoControls(props) {

    const { routes } = useAppContext()

    const [showLogs, setShowLogs] = React.useState(false)

    const progressPercent = 100 * (props.progressSeconds / props.durationSeconds)
    const progressDisplay = util.secondsToTimestamp(props.progressSeconds)
    const durationDisplay = util.secondsToTimestamp(props.durationSeconds)

    if (showLogs) {
        return (
            <Modal
                style={styles.prompt}
                onRequestClose={() => { setShowLogs(false) }}>
                <FillView scroll style={styles.prompt}>
                    <SnowGrid scroll={false} itemsPerRow={1}>
                        <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                    </SnowGrid>
                    <SnowGrid
                        scroll={false}
                        itemsPerRow={1}
                        items={props.logs}
                        renderItem={(log) => { return <SnowText shrink>{log}</SnowText> }} />
                    <SnowGrid scroll={false} itemsPerRow={1}>
                        <SnowTextButton title="Close Logs" onPress={() => { setShowLogs(false) }} />
                    </SnowGrid>
                </FillView>
            </Modal>
        )
    }
    return (
        (
            <FillView scroll style={styles.background}>
                <SnowText>{props.videoTitle}</SnowText>
                <Slider
                    style={styles.row}
                    minimumValue={0}
                    maximumValue={100}
                    value={progressPercent}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#cccccc"
                    onSlidingComplete={props.onSeek}
                    onValueChange={props.onSeek}
                />
                <SnowText style={styles.progress}>{progressDisplay} / {durationDisplay}</SnowText>

                <View style={styles.columns}>
                    <SnowTextButton shouldFocus={true} title="Resume" onPress={props.hideControls} />
                    <SnowTextButton title="Logs" onPress={() => { setShowLogs(true) }} />
                    <SnowTextButton title="Stop" onPress={routes.funcBack()} />
                </View>

                <SnowTrackSelector
                    style={styles.row}
                    tracks={props.tracks}
                    selectTrack={props.selectTrack}
                    audioTrack={props.audioTrack}
                    subtitleTrack={props.subtitleTrack}
                />
            </FillView >
        )
    )
}