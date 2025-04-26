import React from 'react'
import { Dimensions, ScrollView, View } from 'react-native'
import Slider from '@react-native-community/slider';

import util from '../util'

import SnowButton from './snow-button'
import SnowGrid from './snow-grid'
import SnowTrackSelector from './snow-track-selector'
import SnowText from './snow-text';
// TODO Make the controls transparent, so you can see the scrubbing

function Logs(props) {
    return <View></View>
}

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const scrollStyle = {
    height: '100%',
    width: '100%',
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
}

const scrollContainerStyle = {
    height: '100%',
    width: '100%',
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
}

const containerStyle = {
    margin: 30
}

export default function SnowVideoControls(props) {

    const progressPercent = 100 * (props.progressSeconds / props.durationSeconds)

    const buttons = [
        <SnowButton hasTVPreferredFocus={true} title="Resume" onPress={props.hideControls} />,
        <SnowButton title="Logs" onPress={props.hideControls} />
    ]
    const progressDisplay = util.secondsToTimestamp(props.progressSeconds)
    const durationDisplay = util.secondsToTimestamp(props.durationSeconds)
    return (
        (
            <View style={containerStyle}>
                <Slider
                    style={{ height: 400, flex: 2 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={progressPercent}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#cccccc"
                    onSlidingComplete={props.onSeek}
                />
                <SnowText style={{ textAlign: 'center' }}>{progressDisplay} / {durationDisplay}</SnowText>
                <SnowGrid style={{ flex: 1 }} data={buttons} renderItem={(item) => item} />
                <SnowTrackSelector
                    style={{ flex: 4 }}
                    tracks={props.tracks}
                    selectTrack={props.selectTrack}
                    audioTrack={props.audioTrack}
                    subtitleTrack={props.subtitleTrack}
                />
            </View >
        )
    )
}