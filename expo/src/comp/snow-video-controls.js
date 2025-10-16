import React from 'react'
import Snow, {
    SnowFillView,
    SnowGrid,
    SnowLabel,
    SnowRangeSlider,
    SnowTabs,
    SnowText,
    SnowTextButton,
    SnowView,
    SnowTarget
} from 'expo-snowui'

import { useAppContext } from '../app-context'
import { Player } from 'snowstream'
import SnowTrackSelector from './snow-track-selector'

export default function SnowVideoControls(props) {
    const { SnowStyle } = Snow.useSnowContext(props)
    const styles = {
        progress: {
            flexBasis: '100%',
            textAlign: 'center',
            fontWeight: 'bold',
        }
    }
    const { apiClient, currentRoute } = useAppContext()
    const player = Player.useSnapshot(Player.state)

    const playerKind = player.playerKind

    const [showLogs, setShowLogs] = React.useState(false)
    const [logTitle, setLogTitle] = React.useState(playerKind !== 'rnv' ? playerKind + ' Logs' : 'exo Logs')

    const persistLogs = () => {
        apiClient.savePlaybackLogs(player.logs).then((response) => {
            setLogTitle(response.cache_key)
        })
    }

    let swapTitle = "Swap to mpv"
    if (playerKind === 'mpv') {
        swapTitle = 'Swap to exo'
    }

    let transcodeTitle = "Start Transcoding"
    if (player.isTranscode) {
        transcodeTitle = "Stop Transcoding"
    }

    let tabs = [
        'Playback'
    ]

    if (playerKind !== 'rnv') {
        tabs.push('Style')
    }

    if (player.mediaTracks) {
        tabs.push('Track')
    }

    tabs.push('Advanced')

    let subtitleControls = null
    if (playerKind !== 'rnv') {
        subtitleControls = (
            <SnowGrid itemsPerRow={4}>
                <SnowTextButton title="Sub Smaller" onPress={() => {
                    Player.action.changeSubtitleFontSize(-1)
                }} />
                <SnowTextButton title="Sub Bigger" onPress={() => {
                    Player.action.changeSubtitleFontSize(1)
                }} />
                <SnowTextButton title="Sub Darker" onPress={() => {
                    Player.action.changeSubtitleColor(-1)
                }} />
                <SnowTextButton title="Sub Lighter" onPress={() => {
                    Player.action.changeSubtitleColor(1)
                }}
                />
            </SnowGrid>
        )
    }
    let trackControls = null
    if (player.mediaTracks) {
        trackControls = (
            <SnowTrackSelector
                focusKey="track-selector"
                style={styles.row}
                showDelay={true}
                audioDelay={player.audioDelaySeconds}
                setAudioDelay={Player.action.setAudioDelay}
                subtitleDelay={player.subtitleDelaySeconds}
                setSubtitleDelay={Player.action.setSubtitleDelay}
                tracks={player.mediaTracks}
                selectTrack={Player.action.onSelectTrack}
                audioTrack={player.audioTrackIndex}
                subtitleTrack={player.subtitleTrackIndex}
            />
        )
    }
    let slider = null
    if (player.durationSeconds > 0) {
        const onPercentChange = (percent) => {
            Player.action.onProgress(null, 'manual-seek', percent);
        }
        slider = (
            <>
                <SnowRangeSlider
                    focusKey="seekbar"
                    focusDown="control-tabs"
                    width={750}
                    debounce={true}
                    percent={player.progressPercent ?? 0}
                    onValueChange={onPercentChange}
                />
                <SnowText style={styles.progress}>{player.progressDisplay ?? ''} / {player.durationDisplay}</SnowText>
            </>
        )
    }

    return (
        (
            <>
                <>
                    <SnowLabel center>{player.videoTitle}</SnowLabel>
                    {slider}
                </>
                <SnowTabs focusStart focusKey="control-tabs" headers={tabs}>
                    <SnowGrid itemsPerRow={3}>
                        <SnowTextButton title="Resume" onPress={Player.action.onResumeVideo} />
                        <SnowTextButton title="Stop" onPress={() => { Player.action.onStopVideo() }} />
                        <SnowTextButton title="Home" onPress={() => { Player.action.onStopVideo(true) }} />
                    </SnowGrid>
                    {subtitleControls}
                    {trackControls}
                    <SnowGrid short itemsPerRow={3}>
                        <SnowTextButton title={logTitle} onPress={() => {
                            Player.action.setVideoLogsVisible(true)
                        }} onLongPress={persistLogs} />
                        <SnowTextButton title={swapTitle} onPress={() => {
                            let newParams = { ...currentRoute.routeParams }
                            newParams.forcePlayer = 'mpv'
                            if (playerKind === 'mpv') {
                                newParams.forcePlayer = 'exo'
                            }
                            newParams.seekToSeconds = player.progressSeconds
                            Player.action.onChangeRouteParams(newParams)
                        }} />
                        <SnowTextButton title={transcodeTitle} onPress={() => {
                            let newParams = { ...currentRoute.routeParams }
                            newParams.transcode = !player.isTranscode
                            newParams.seekToSeconds = player.progressSeconds
                            Player.action.onChangeRouteParams(newParams)
                        }} />
                    </SnowGrid>
                </SnowTabs>
            </>
        )
    )
}