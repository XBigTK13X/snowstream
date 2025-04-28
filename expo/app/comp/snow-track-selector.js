import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import SnowText from './snow-text'
import SnowGrid from './snow-grid'
import SnowTextButton from './snow-text-button'

const styles = {
    rows: {
        flexBasis: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    row: {
        flexBasis: '100%'
    },
    columns: {
        flexBasis: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1
    },
    column: {
        flex: 3,
        flexBasis: '33%'
    }
}
styles.button = {
    wrapper: styles.column,
    container: styles.column,
    button: styles.column
}

const buttonStyles = {
    wrapper: styles.column
}

function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <View style={styles.rows}>
            <SnowText heading style={styles.row}>{props.title} ({props.tracks.length})</SnowText>
            <View style={styles.columns}>
                {props.tracks.map((track, trackKey) => {
                    return (
                        <SnowTextButton
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
        <View style={styles.rows}>
            {props.tracks.audio.length ? <TrackList
                kind="audio"
                title="Audio"
                tracks={props.tracks.audio}
                selectTrack={props.selectTrack}
                activeTrack={props.audioTrack}
            /> : null}
            {props.tracks.subtitle.length ? <TrackList
                kind="subtitle"
                title="Subtitles"
                tracks={props.tracks.subtitle}
                selectTrack={props.selectTrack}
                activeTrack={props.subtitleTrack}
            /> : null}
        </View>
    )
}