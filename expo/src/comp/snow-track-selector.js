import React from 'react'
import { View } from 'react-native'
import Snow from 'expo-snowui'
import util from '../util'

function TrackList(props) {
    if (!props.tracks) {
        return null
    }
    const { readFocusProps } = Snow.useFocusContext()
    let activeTrack = props.activeTrack === -1 ? null : props.tracks.filter((track) => {
        return props.isAudio ? track.audio_index === props.activeTrack : track.subtitle_index === props.activeTrack
    })[0]
    let activeBitRate = null;
    if (activeTrack) {
        activeBitRate = `[${util.bitsToPretty(activeTrack.bit_rate)}/s]`
    }
    let header = (
        <Snow.Text>
            {props.title} ({props.tracks.length}) {activeBitRate}
        </Snow.Text>
    )
    let gridProps = readFocusProps(props)
    if (props.showDelay) {
        gridProps.focusKey = props.focusKey + '-buttons'
        header = (
            <Snow.Grid assignFocus={false} itemsPerRow={3} shrink>
                <Snow.Text>
                    {props.title} ({props.tracks.length}) {activeBitRate}
                </Snow.Text>
                <Snow.Input
                    focusKey={props.focusKey}
                    focusDown={gridProps.focusKey}
                    value={props.delay}
                    onValueChange={props.setDelay}
                />
                <Snow.Text>Seconds Delay</Snow.Text>
            </Snow.Grid>
        )

    }
    return (
        <View>
            {header}
            <Snow.Grid {...gridProps} short shrink itemsPerRow={4}>
                {props.tracks.map((track, trackKey) => {
                    let display = track.language ? track.language + ' - ' : ''
                    display += `${(!track.title.includes('.') && track.title) ? track.title + ' - ' : ''}`
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
                        <Snow.TextButton
                            key={trackKey}
                            tall
                            selected={relativeIndex === props.activeTrack}
                            title={display}
                            onPress={() => { props.selectTrack(track) }}
                        />
                    )
                })}
            </Snow.Grid>
        </View>
    )
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    return (
        <Snow.FillView>
            {props.tracks.audio.length ? <TrackList
                focusKey={props.focusKey}
                focusDown="subtitle-tracks"
                kind="audio"
                title="Audio"
                showDelay={props.showDelay}
                delay={props.audioDelaySeconds}
                setDelay={props.setAudioDelay}
                isAudio={true}
                tracks={props.tracks.audio.filter((track) => { return track.score > 0 || props.tracks.audio.length < 3 })}
                selectTrack={props.selectTrack}
                activeTrack={props.audioTrack}
            /> : null}
            {props.tracks.subtitle.length ? <TrackList
                focusKey="subtitle-tracks"
                kind="subtitle"
                title="Subtitles"
                showDelay={props.showDelay}
                delay={props.subtitleDelaySeconds}
                setDelay={props.setSubtitleDelay}
                tracks={props.tracks.subtitle.filter((track) => { return track.score > 0 || props.tracks.subtitle.length < 3 })}
                selectTrack={props.selectTrack}
                activeTrack={props.subtitleTrack}
            /> : null}
        </Snow.FillView>
    )
}