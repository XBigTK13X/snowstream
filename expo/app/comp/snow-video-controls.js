import React from 'react'
import { StyleSheet, Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import SnowText from './snow-text'
import SnowButton from './snow-button'
import SnowGrid from './snow-grid'
// TODO Make the controls transparent, so you can see the scrubbing

function SubtitleControls(props) {
    return <View></View>
}

function TrackControls(props) {
    return <View></View>
}

function Logs(props) {
    return <View></View>
}

export default function SnowVideoControls(props) {



    const buttons = [
        <SnowButton hasTVPreferredFocus={true} title="Resume" onPress={hideControls} />,
        <SnowButton title="Subtitles" onPress={hideControls} />,
        <SnowButton title="Audio" onPress={hideControls} />,
        <SnowButton title="Logs" onPress={hideControls} />
    ]

    return (
        <SnowGrid data={buttons} renderItem={(item) => item} />
    )
}