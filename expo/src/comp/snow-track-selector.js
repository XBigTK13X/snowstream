import React from 'react'
import { View } from 'react-native'
import util from '../util'
import SnowGrid from './snow-grid'
import SnowText from './snow-text'
import SnowTextButton from './snow-text-button'
import SnowInput from './snow-input'
import FillView from './fill-view'

function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    let activeTrack = props.activeTrack === -1 ? null : props.tracks.filter((track) => {
        return props.isAudio ? track.audio_index === props.activeTrack : track.subtitle_index === props.activeTrack
    })[0]
    let activeBitRate = null;
    if (activeTrack) {
        activeBitRate = `[${util.bitsToPretty(activeTrack.bit_rate)}/s]`
    }
    let header = (
        <SnowText>
            {props.title} ({props.tracks.length}) {activeBitRate}
        </SnowText>
    )
    if (props.showDelay) {
        header = (
            <SnowGrid itemsPerRow={3} shrink>
                {header}
                <SnowInput short value={props.delay} onValueChange={props.setDelay} />
                <SnowText>Seconds Delay</SnowText>
            </SnowGrid>
        )
    }
    return (
        <FillView>
            {header}

            <SnowGrid short shrink itemsPerRow={4}>
                {props.tracks.map((track, trackKey) => {
                    let display = track.language ? track.language + ' - ' : ''
                    display += `${(track.title.indexOf('.') === -1 && track.title) ? track.title + ' - ' : ''}`
                    if (props.isAudio) {
                        display += `${track.codec.replace('A_', '')} - `
                        display += `${track.channel_count}ch`
                        if (track.is_lossless) {
                            display += ` L`
                        }
                    }
                    else {
                        display += `${track.format_full ? track.format_full : track.format}`
                    }
                    if (display.length > 30) {
                        display = display.substring(0, 30) + '...'
                    }
                    const relativeIndex = props.isAudio ? track.audio_index : track.subtitle_index
                    display += ` [${relativeIndex}]`
                    return (
                        <SnowTextButton
                            key={trackKey}
                            short
                            selected={relativeIndex === props.activeTrack}
                            title={display}
                            onPress={() => { props.selectTrack(track) }}
                        />
                    )
                })}
            </SnowGrid>
        </FillView>
    )
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <FillView>
            {props.tracks.audio.length ? <TrackList
                kind="audio"
                title="Audio"
                showDelay={props.showDelay}
                delay={props.audioDelay}
                setDelay={props.setAudioDelay}
                isAudio={true}
                tracks={props.tracks.audio.filter((track) => { return track.score > 0 || props.tracks.audio.length < 3 })}
                selectTrack={props.selectTrack}
                activeTrack={props.audioTrack}
            /> : null}
            {props.tracks.subtitle.length ? <TrackList
                kind="subtitle"
                title="Subtitles"
                showDelay={props.showDelay}
                delay={props.subtitleDelay}
                setDelay={props.setSubtitleDelay}
                tracks={props.tracks.subtitle.filter((track) => { return track.score > 0 || props.tracks.subtitle.length < 3 })}
                selectTrack={props.selectTrack}
                activeTrack={props.subtitleTrack}
            /> : null}
        </FillView>
    )
}