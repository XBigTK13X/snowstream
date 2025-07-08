import React from 'react'
import SnowText from './snow-text'
import SnowTextButton from './snow-text-button'
import SnowGrid from './snow-grid'
import FillView from './fill-view'
import { View } from 'react-native'

function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <View>
            <SnowText>
                {props.title} ({props.tracks.length})
            </SnowText>

            <SnowGrid itemsPerRow={5} scroll={false}>
                {props.tracks.map((track, trackKey) => {
                    let display = `${(track.title.indexOf('.') === -1 && track.title) ? track.title + ' - ' : ''}${track.format_full ? track.format_full : track.format}`
                    if (display && display.length > 30) {
                        display = display.substring(0, 30) + '...'
                    }
                    const relativeIndex = track.kind === 'audio' ? track.audio_index : track.subtitle_index
                    return (
                        <SnowTextButton
                            key={trackKey}
                            selected={relativeIndex === props.activeTrack}
                            title={`${display} [${relativeIndex}]`}
                            onPress={() => { props.selectTrack(track) }}
                        />
                    )
                })}
            </SnowGrid>
        </View>
    )
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    return (
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
    )
}