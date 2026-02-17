import React from 'react'
import Snow from 'expo-snowui'
import { View } from 'react-native'
import Player from 'snowstream-player'
import SnowTrackSelector from './snow-track-selector'

export default function SnowVideoControls(props) {
    const { openOverlay, closeOverlay, SnowStyle } = Snow.useSnowContext()
    const styles = {
        progress: {
            flexBasis: '100%',
            textAlign: 'center',
            fontWeight: 'bold',
        },
        player: {
            padding: 30,
            backgroundColor: SnowStyle.color.transparentDark
        }
    }
    const player = Player.useSnapshot(Player.state)

    const playerKind = player.playerKind

    const [logTitle, setLogTitle] = React.useState(playerKind !== 'rnv' ? playerKind + ' Logs' : 'exo Logs')

    const [controlsVisible, setControlsVisible] = React.useState(true)

    React.useEffect(() => {
        return () => {
            setControlsVisible(true)
        }
    }, [])

    React.useEffect(() => {
        if (!controlsVisible) {
            openOverlay({
                props: {
                    focusStart: true,
                    focusKey: 'hidden-controls',
                    focusLayer: 'hidden-controls',
                    onPress: () => {
                        closeOverlay()
                        setControlsVisible(true)
                    }
                }
            })
            return () => {
                setControlsVisible(true)
            }
        }
    }, [controlsVisible])

    if (!controlsVisible) {
        return <View></View>
    }

    const persistLogs = () => {
        Player.action.savePlaybackLogs().then((response) => {
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
        'Playback',
        'Style'
    ]

    if (player.mediaTracks) {
        tabs.push('Track')
    }

    tabs.push('Advanced')

    let playbackControls = (
        <Snow.Grid itemsPerRow={2}>
            <Snow.TextButton title="Resume" onPress={() => {
                Player.action.onResumeVideo()
            }} />
            <Snow.TextButton title="Hide Controls" onPress={() => {
                setControlsVisible(false)
            }} />
            <Snow.TextButton title="Stop" onPress={() => {
                Player.action.onStopVideo()
            }} />
            <Snow.TextButton title="Home" onPress={() => {
                Player.action.onStopVideo(true)
            }} />
        </Snow.Grid>
    )

    let subtitleControls = (
        <Snow.Grid itemsPerRow={2}>
            <Snow.TextButton title="Sub Smaller" onPress={() => {
                Player.action.changeSubtitleFontScale(-1)
            }} />
            <Snow.TextButton title="Sub Bigger" onPress={() => {
                Player.action.changeSubtitleFontScale(1)
            }} />
            <Snow.TextButton title="Sub Darker" onPress={() => {
                Player.action.changeSubtitleColor(-1)
            }} />
            <Snow.TextButton title="Sub Lighter" onPress={() => {
                Player.action.changeSubtitleColor(1)
            }}
            />
        </Snow.Grid>
    )
    let trackControls = null
    if (player.mediaTracks) {
        trackControls = (
            <SnowTrackSelector
                focusKey="track-selector"
                style={styles.row}
                showDelay={true}
                audioDelaySeconds={player.audioDelaySeconds}
                setAudioDelaySeconds={Player.action.setAudioDelaySeconds}
                subtitleDelaySeconds={player.subtitleDelaySeconds}
                setSubtitleDelaySeconds={Player.action.setSubtitleDelaySeconds}
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
                <Snow.RangeSlider
                    focusKey="seekbar"
                    focusDown="control-tabs"
                    width={750}
                    debounce={true}
                    percent={player.progressPercent}
                    onValueChange={onPercentChange}
                />
                <Snow.Text style={styles.progress}>{player.progressDisplay ?? ''} / {player.durationDisplay}            This video is {player.isTranscode ? 'transcoding' : 'playing directly'} through {player.playerKind === 'rnv' ? 'exo' : 'mpv'}.</Snow.Text>
            </>
        )
    }
    return (
        (
            <View style={styles.player}>
                <>
                    <Snow.Label center>{player.videoTitle}</Snow.Label>
                    {slider}
                </>
                <Snow.Tabs focusStart focusKey="control-tabs" headers={tabs}>
                    {playbackControls}
                    {subtitleControls}
                    {trackControls}
                    <Snow.Grid short itemsPerRow={3}>
                        <Snow.TextButton title={logTitle} onPress={() => {
                            Player.action.setVideoLogsVisible(true)
                        }} onLongPress={persistLogs} />
                        {/* <Snow.TextButton title={swapTitle} onPress={() => {
                            Player.action.togglePlayerKind()
                        }} />
                        <Snow.TextButton title={transcodeTitle} onPress={() => {
                            Player.action.toggleTranscode()
                        }} /> */}
                    </Snow.Grid>
                </Snow.Tabs>
            </View>
        )
    )
}