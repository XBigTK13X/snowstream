import React from 'react'
import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'
import Player from 'snowstream-player'
import SnowTrackSelector from './snow-track-selector'

export default function SnowVideoControls(props) {
    const {
        SnowStyle,
        envelope,
        updateEnvelope,
        getEnvelope,
        currentRoute
    } = Snow.useSnowContext()

    const { clientOptions, apiClient } = useAppContext()
    const routeParams = currentRoute?.routeParams || {}

    const playerKind = Player.selectors.playerKind(envelope, routeParams, clientOptions)
    const isTranscode = Player.selectors.isTranscode(envelope, routeParams, clientOptions)
    const progressPercent = Player.selectors.progressPercent(envelope)
    const progressDisplay = Player.selectors.progressDisplay(envelope)
    const durationDisplay = Player.selectors.durationDisplay(envelope)

    const [logTitle, setLogTitle] = React.useState('Persist Logs')
    const [localPercent, setLocalPercent] = React.useState(null)
    const isInteractingRef = React.useRef(false)

    const styles = {
        progress: {
            flexBasis: '100%',
            textAlign: 'center',
            fontWeight: 'bold'
        },
        player: {
            padding: 30,
            backgroundColor: SnowStyle.color.transparentDark
        }
    }

    const persistLogs = () => {
        if (apiClient?.savePlaybackLogs) {
            apiClient.savePlaybackLogs(envelope.logs || []).then((response) => {
                setLogTitle(response.cache_key)
            })
        }
    }

    const tabs = ['Playback', 'Style']
    if (envelope.mediaTracks) {
        tabs.push('Track')
    }

    let slider = null
    if (envelope.durationSeconds > 0) {
        const activePercent = isInteractingRef.current && localPercent !== null
            ? localPercent
            : progressPercent

        const onPercentChange = (percentValue) => {
            isInteractingRef.current = true
            setLocalPercent(percentValue)
            props.actions?.onProgress(null, 'manual-seek', percentValue)
            isInteractingRef.current = false
            setLocalPercent(null)
        }

        slider = (
            <Snow.View yy={1}>
                <Snow.RangeSlider
                    focusKey="seekbar"
                    width={SnowStyle.isPortrait ? 350 : 750}
                    debounce={true}
                    percent={activePercent}
                    onValueChange={onPercentChange}
                />
                <Snow.Text style={styles.progress}>
                    {progressDisplay ?? ''} / {durationDisplay} - {isTranscode ? 'transcoding' : 'direct play'} via {playerKind === 'rnv' ? 'exo' : 'mpv'}
                </Snow.Text>
            </Snow.View>
        )
    }

    const playbackControls = (
        <Snow.Grid itemsPerRow={2}>
            <Snow.TextButton title="Resume" onPress={() => props.actions?.onResumeVideo()} />
            <Snow.TextButton title="Hide Controls" onPress={() => updateEnvelope({ controlsVisible: false })} />
            <Snow.TextButton title="Stop" onPress={() => props.actions?.onStopVideo(false)} />
            <Snow.TextButton title="Home" onPress={() => props.actions?.onStopVideo(true)} />
        </Snow.Grid>
    )

    const subtitleControls = (
        <Snow.Grid itemsPerRow={2}>
            <Snow.TextButton title="Sub Smaller" onPress={() => {
                updateEnvelope((prev) => ({ subtitleFontScale: prev.subtitleFontScale - 0.1 }))
            }} />
            <Snow.TextButton title="Sub Bigger" onPress={() => {
                updateEnvelope((prev) => ({ subtitleFontScale: prev.subtitleFontScale + 0.1 }))
            }} />
            <Snow.TextButton title="Sub Darker" onPress={() => {
                updateEnvelope((prev) => {
                    const nextShade = Math.min(1.0, Math.max(0.0, prev.subtitleColor.shade - 0.15))
                    return { subtitleColor: { ...prev.subtitleColor, shade: nextShade } }
                })
            }} />
            <Snow.TextButton title="Sub Lighter" onPress={() => {
                updateEnvelope((prev) => {
                    const nextShade = Math.min(1.0, Math.max(0.0, prev.subtitleColor.shade + 0.15))
                    return { subtitleColor: { ...prev.subtitleColor, shade: nextShade } }
                })
            }} />
        </Snow.Grid>
    )

    const trackControls = envelope.mediaTracks ? (
        <SnowTrackSelector
            focusKey="track-selector"
            showDelay={true}
            audioDelaySeconds={envelope.audioDelaySeconds}
            setAudioDelaySeconds={(val) => updateEnvelope({ audioDelaySeconds: val })}
            subtitleDelaySeconds={envelope.subtitleDelaySeconds}
            setSubtitleDelaySeconds={(val) => updateEnvelope({ subtitleDelaySeconds: val })}
            tracks={envelope.mediaTracks}
            selectTrack={(track) => {
                if (track.kind === 'audio') {
                    updateEnvelope((prev) => ({
                        audioTrackIndex: prev.audioTrackIndex === track.audio_index ? -1 : track.audio_index
                    }))
                } else if (track.kind === 'subtitle') {
                    updateEnvelope((prev) => ({
                        subtitleTrackIndex: prev.subtitleTrackIndex === track.subtitle_index ? -1 : track.subtitle_index
                    }))
                }
            }}
            audioTrack={envelope.audioTrackIndex}
            subtitleTrack={envelope.subtitleTrackIndex}
        />
    ) : null

    return (
        <Snow.View parentPath={props.parentPath} style={styles.player}>
            <Snow.Label center>{envelope.videoTitle}</Snow.Label>
            {slider}
            <Snow.Tabs yy={2} focusStart focusKey="control-tabs" headers={tabs}>
                {playbackControls}
                {subtitleControls}
                {trackControls}
            </Snow.Tabs>
        </Snow.View>
    )
}