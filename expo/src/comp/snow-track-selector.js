import React from 'react'
import { View } from 'react-native'
import SnowText from './snow-text'
import SnowTextButton from './snow-text-button'
import SnowGrid from './snow-grid'
import FillView from './fill-view'

const styles = {
    rows: {
        flexBasis: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
    },
    row: {
        flexBasis: '100%',
        margin: 0,
        padding: 0
    },
}
function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <FillView>
            <View>
                <SnowText style={styles.row}>
                    {props.title} ({props.tracks.length})
                </SnowText>

                <SnowGrid itemsPerRow={5} gridStyle={styles.row} scroll={false}>
                    {props.tracks.map((track, trackKey) => {
                        let display = track.display
                        if (display && display.length > 30) {
                            display = display.substring(0, 30) + '...'
                        }
                        return (
                            <SnowTextButton
                                key={trackKey}
                                selected={track.relative_index === props.activeTrack}
                                title={`${display} [${track.relative_index}]`}
                                onPress={() => { props.selectTrack(track) }}
                            />
                        )
                    })}
                </SnowGrid>
            </View>
        </FillView>
    )
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <FillView>
            <View>
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
        </FillView>
    )
}