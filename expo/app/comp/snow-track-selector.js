import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import SnowText from './snow-text'
import SnowGrid from './snow-grid'
import SnowButton from './snow-button'

const columnsStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
}

const itemStyle = {
    width: 250,
    height: 50,
    padding: 10,
    margin: 10,
}

function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <View>
            <SnowText>{props.title}</SnowText>
            <View class={columnsStyle}>
                {props.tracks.map((track, trackKey) => {
                    return (
                        <SnowButton
                            style={itemStyle}
                            key={trackKey}
                            selected={track.relative_index === props.activeTrack}
                            title={`${track.relative_index}) ${track.display}`}
                            onPress={() => { props.selectTrack(track) }}
                        />
                    )
                })}
            </View>
        </View>
    )
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <View style={columnsStyle}>
            <TrackList
                kind="audio"
                title="Audio"
                tracks={props.tracks.audio}
                selectTrack={props.selectTrack}
                activeTrack={props.audioTrack}
            />
            <TrackList
                kind="subtitle"
                title="Subtitles"
                tracks={props.tracks.subtitle}
                selectTrack={props.selectTrack}
                activeTrack={props.subtitleTrack}
            />
        </View>
    )
}