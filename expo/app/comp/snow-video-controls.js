import React from 'react'
import { Dimensions, ScrollView, View } from 'react-native'
import SnowButton from './snow-button'
import SnowGrid from './snow-grid'
import SnowTrackSelector from './snow-track-selector'
// TODO Make the controls transparent, so you can see the scrubbing

function Logs(props) {
    return <View></View>
}

export default function SnowVideoControls(props) {

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

    const buttons = [
        <SnowButton hasTVPreferredFocus={true} title="Resume" onPress={props.hideControls} />,
        <SnowButton title="Logs" onPress={props.hideControls} />
    ]
    return (
        (
            <ScrollView
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                style={scrollStyle}
                contentContainerStyle={scrollContainerStyle}>
                <SnowGrid style={{ flex: 1 }} data={buttons} renderItem={(item) => item} />
                <SnowTrackSelector
                    style={{ flex: 4 }}
                    tracks={props.tracks}
                    selectTrack={props.selectTrack}
                    audioTrack={props.audioTrack}
                    subtitleTrack={props.subtitleTrack}
                />
            </ScrollView>
        )
    )
}