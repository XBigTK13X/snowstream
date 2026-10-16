import React from 'react'
import Snow from 'expo-snowui'
import util from '../util'
import { useAppContext } from '../app-context'
import SnowTrackSelector from './snow-track-selector'

export default function SnowVideoControls(props) {
    const {
        SnowStyle,
        sendHubData,
        emitHubEvent,
        useHubState
    } = Snow.useSnowContext(props)

    const appContext = useAppContext()
    const apiClient = props.apiClient || appContext?.apiClient

    const videoTitle = useHubState((state) => state?.videoTitle)
    const durationSeconds = useHubState((state) => state?.durationSeconds) || 0.0
    const progressSeconds = useHubState((state) => state?.progressSeconds)
    const isTranscode = useHubState((state) => state?.isTranscode)
    const playerKind = useHubState((state) => state?.playerKind) || 'mpv'
    const mediaTracks = useHubState((state) => state?.mediaTracks)
    const audioDelaySeconds = useHubState((state) => state?.audioDelaySeconds) || 0
    const subtitleDelaySeconds = useHubState((state) => state?.subtitleDelaySeconds) || 0
    const audioTrackIndex = useHubState((state) => state?.audioTrackIndex)
    const subtitleTrackIndex = useHubState((state) => state?.subtitleTrackIndex)
    const logs = useHubState((state) => state?.logs)

    const [logTitle, setLogTitle] = React.useState('Persist Logs')
    const [localPercent, setLocalPercent] = React.useState(null)
    const isInteractingRef = React.useRef(false)

    const progressPercent = durationSeconds > 0 && progressSeconds != null
        ? progressSeconds / durationSeconds
        : 0

    const progressDisplay = durationSeconds > 0 && progressSeconds != null
        ? util.secondsToTimestamp(progressSeconds)
        : null

    const durationDisplay = durationSeconds > 0
        ? util.secondsToTimestamp(durationSeconds)
        : null

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
            apiClient.savePlaybackLogs(logs || []).then((response) => {
                setLogTitle(response.cache_key)
            })
        }
    }

    const tabs = ['Playback', 'Style']
    if (mediaTracks) {
        tabs.push('Track')
    }

    let slider = null
    if (durationSeconds > 0) {
        const activePercent = isInteractingRef.current && localPercent !== null
            ? localPercent
            : progressPercent

        const onPercentChange = (percentValue) => {
            isInteractingRef.current = true
            setLocalPercent(percentValue)
            emitHubEvent('player.progress', {
                seconds: null,
                source: 'manual-seek',
                percent: percentValue
            })
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
                    {progressDisplay ?? ''} / {durationDisplay} {isTranscode ? 'transcoding' : 'direct play'} via {playerKind === 'exo' ? 'exo' : 'mpv'}
                </Snow.Text>
            </Snow.View>
        )
    }

    const playbackControls = (
        <Snow.Grid itemsPerRow={2}>
            <Snow.TextButton
                title="Resume"
                onPress={() => emitHubEvent('player.resume')}
            />
            <Snow.TextButton
                title="Hide Controls"
                onPress={() => sendHubData({ controlsVisible: false }, 'player.controlsHidden')}
            />
            <Snow.TextButton
                title="Stop"
                onPress={() => emitHubEvent('player.stop', { goHome: false })}
            />
            <Snow.TextButton
                title="Home"
                onPress={() => emitHubEvent('player.stop', { goHome: true })}
            />
        </Snow.Grid>
    )

    const subtitleControls = (
        <Snow.Grid itemsPerRow={2}>
            <Snow.TextButton
                title="Sub Smaller"
                onPress={() => {
                    sendHubData((prevState) => ({
                        subtitleFontScale: (prevState?.subtitleFontScale || 1.0) - 0.1
                    }), 'player.subtitleScaleChanged')
                }}
            />
            <Snow.TextButton
                title="Sub Bigger"
                onPress={() => {
                    sendHubData((prevState) => ({
                        subtitleFontScale: (prevState?.subtitleFontScale || 1.0) + 0.1
                    }), 'player.subtitleScaleChanged')
                }}
            />
            <Snow.TextButton
                title="Sub Darker"
                onPress={() => {
                    sendHubData((prevState) => {
                        const nextShade = Math.min(1.0, Math.max(0.0, (prevState?.subtitleColor?.shade || 1.0) - 0.15))
                        return {
                            subtitleColor: { ...(prevState?.subtitleColor || {}), shade: nextShade }
                        }
                    }, 'player.subtitleColorChanged')
                }}
            />
            <Snow.TextButton
                title="Sub Lighter"
                onPress={() => {
                    sendHubData((prevState) => {
                        const nextShade = Math.min(1.0, Math.max(0.0, (prevState?.subtitleColor?.shade || 1.0) + 0.15))
                        return {
                            subtitleColor: { ...(prevState?.subtitleColor || {}), shade: nextShade }
                        }
                    }, 'player.subtitleColorChanged')
                }}
            />
        </Snow.Grid>
    )

    const trackControls = mediaTracks ? (
        <SnowTrackSelector
            focusKey="track-selector"
            showDelay={true}
            audioDelaySeconds={audioDelaySeconds}
            setAudioDelaySeconds={(val) => sendHubData({ audioDelaySeconds: val }, 'player.audioDelayChanged')}
            subtitleDelaySeconds={subtitleDelaySeconds}
            setSubtitleDelaySeconds={(val) => sendHubData({ subtitleDelaySeconds: val }, 'player.subtitleDelayChanged')}
            tracks={mediaTracks}
            selectTrack={(track) => {
                if (track.kind === 'audio') {
                    sendHubData((prevState) => ({
                        audioTrackIndex: prevState?.audioTrackIndex === track.audio_index ? -1 : track.audio_index
                    }), 'player.audioTrackChanged')
                } else if (track.kind === 'subtitle') {
                    sendHubData((prevState) => ({
                        subtitleTrackIndex: prevState?.subtitleTrackIndex === track.subtitle_index ? -1 : track.subtitle_index
                    }), 'player.subtitleTrackChanged')
                }
            }}
            audioTrack={audioTrackIndex}
            subtitleTrack={subtitleTrackIndex}
        />
    ) : null

    return (
        <Snow.View parentPath={props.parentPath} style={styles.player}>
            <Snow.Label center>{videoTitle}</Snow.Label>
            {slider}
            <Snow.Tabs yy={2} focusStart focusKey="control-tabs" headers={tabs}>
                {playbackControls}
                {subtitleControls}
                {trackControls}
            </Snow.Tabs>
        </Snow.View>
    )
}