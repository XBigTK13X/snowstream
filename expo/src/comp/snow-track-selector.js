import React from 'react'
import { View } from 'react-native'
import Snow from 'expo-snowui'
import util from '../util'

function TrackButtons(props) {
    if (!props.tracks || !props.tracks.length) {
        return null
    }

    let activeTrack = props.activeTrack === -1 ? null : props.tracks.filter((track) => {
        return props.isAudio ? track.audio_index === props.activeTrack : track.subtitle_index === props.activeTrack
    })[0]
    let activeBitRate = null
    if (activeTrack) {
        activeBitRate = `[${util.bitsToPretty(activeTrack.bit_rate)}/s]`
    }

    return (
        <>
            <Snow.Text>
                {props.title} ({props.tracks.length}) {activeBitRate}
            </Snow.Text>
            <Snow.Grid
                focusKey={`${props.focusKey}-${props.kind}-buttons`}
                short
                shrink
                itemsPerRow={4}
                parentPath={props.parentPath}
                yy={props.yy}
            >
                {props.tracks.map((track, trackKey) => {
                    let display = track.language ? track.language + ' - ' : ''
                    display += `${(!track.title.includes('.') && track.title) ? track.title + ' - ' : ''}`
                    if (props.isAudio) {
                        display += `${track.codec.replace('A_', '')}`
                        display += `${track.channel_count}ch`
                        if (track.is_lossless) {
                            display += ` L`
                        }
                    } else {
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
        </>
    )
}

function TrackDelay(props) {
    if (!props.showDelay || !props.hasTracks) {
        return null
    }
    return (
        <Snow.Grid
            assignFocus={false}
            itemsPerRow={3}
            shrink
            parentPath={props.parentPath}
            xx={props.xx}
            yy={props.yy}
        >
            <Snow.Text>{props.title} Delay</Snow.Text>
            <Snow.Input
                value={props.delay}
                onValueChange={props.setDelay}
            />
            <Snow.Text>Seconds Delay</Snow.Text>
        </Snow.Grid>
    )
}

export default function SnowTrackSelector(props) {
    if (!props.tracks) {
        return null
    }
    let audioTracks = []
    for (let track of props.tracks.audio) {
        if (track.score > 0 || props.tracks.audio.length < 3) {
            audioTracks.push(track)
        } else {
            if (props.audioLanguage && props.audioLanguage === track.language) {
                audioTracks.push(track)
            }
        }
    }
    let subtitleTracks = []
    for (let track of props.tracks.subtitle) {
        if (track.score > 0 || props.tracks.subtitle.length < 3) {
            subtitleTracks.push(track)
        }
    }
    return (
        <Snow.View>
            {audioTracks.length ? <TrackButtons
                yy={1}
                parentPath={props.parentPath}
                focusKey={props.focusKey}
                kind="audio"
                title="Audio"
                isAudio={true}
                tracks={audioTracks}
                selectTrack={props.selectTrack}
                activeTrack={props.audioTrack}
            /> : null}

            {subtitleTracks.length ? <TrackButtons
                yy={2}
                parentPath={props.parentPath}
                focusKey="subtitle-tracks"
                kind="subtitle"
                title="Subtitles"
                isAudio={false}
                tracks={subtitleTracks}
                selectTrack={props.selectTrack}
                activeTrack={props.subtitleTrack}
            /> : null}

            <TrackDelay
                yy={3}
                parentPath={props.parentPath}
                title="Audio"
                hasTracks={audioTracks.length > 0}
                showDelay={props.showDelay}
                delay={props.audioDelaySeconds}
                setDelay={props.setAudioDelaySeconds}
            />

            <TrackDelay
                yy={4}
                parentPath={props.parentPath}
                title="Subtitle"
                hasTracks={subtitleTracks.length > 0}
                showDelay={props.showDelay}
                delay={props.subtitleDelaySeconds}
                setDelay={props.setSubtitleDelaySeconds}
            />
        </Snow.View>
    )
}