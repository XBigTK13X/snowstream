import React from 'react'
import { View } from 'react-native'
import Slider from '@react-native-community/slider';

import util from '../util'
import { useSettings } from '../settings-context'

import SnowTrackSelector from './snow-track-selector'
import SnowText from './snow-text';
import SnowTextButton from './snow-text-button'


function Logs(props) {
    return <View></View>
}

const styles = {
    rows: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 60,
        backgroundColor: 'rgba(0,0,0,0.6)'
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
    }
}

const buttonStyles = {
    wrapper: styles.column,
    container: styles.column,
    button: styles.column
}

export default function SnowVideoControls(props) {

    const { routes } = useSettings()

    const progressPercent = 100 * (props.progressSeconds / props.durationSeconds)
    const progressDisplay = util.secondsToTimestamp(props.progressSeconds)
    const durationDisplay = util.secondsToTimestamp(props.durationSeconds)
    return (
        (
            <View style={styles.rows}>
                <Slider
                    style={styles.row}
                    minimumValue={0}
                    maximumValue={100}
                    value={progressPercent}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#cccccc"
                    onSlidingComplete={props.onSeek}
                />
                <SnowText style={styles.progress}>{progressDisplay} / {durationDisplay}</SnowText>

                <View style={styles.columns}>
                    <SnowTextButton shouldFocus={true} title="Resume" onPress={props.hideControls} />
                    <SnowTextButton title="Logs" onPress={props.hideControls} />
                    <SnowTextButton title="Stop" onPress={routes.funcBack()} />
                </View>

                <SnowTrackSelector
                    style={styles.row}
                    tracks={props.tracks}
                    selectTrack={props.selectTrack}
                    audioTrack={props.audioTrack}
                    subtitleTrack={props.subtitleTrack}
                />
            </View >
        )
    )
}