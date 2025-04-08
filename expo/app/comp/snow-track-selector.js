import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import SnowText from './snow-text'
import SnowGrid from './snow-grid'
import SnowButton from './snow-button'

function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <View>
            <SnowText>{props.title}</SnowText>
            {props.tracks.map((track, trackKey) => {
                return (
                    <SnowButton
                        key={trackKey}
                        highlighted={track.relative_index === props.activeTrack}
                        title={`${track.relative_index}) ${track.display}`}
                        onPress={() => { props.selectTrack(track) }}
                    />
                )
            })}
        </View>
    )
}

let columnsStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap'
}

let itemStyle = {
    width: 250,
    height: 60,
    padding: 5,
    margin: 5
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    console.log({ props })
    return (
        <View style={columnsStyle}>
            <TrackList
                style={itemStyle}
                kind="audio"
                title="Audio"
                tracks={props.tracks.audio}
                selectTrack={props.selectTrack}
                activeTrack={props.audioTrack}
            />
            <TrackList
                style={itemStyle}
                kind="subtitle"
                title="Subtitles"
                tracks={props.tracks.subtitle}
                selectTrack={props.selectTrack}
                activeTrack={props.subtitleTrack}
            />
        </View>
    )
}