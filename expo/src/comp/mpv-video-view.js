import React from 'react'
import LibmpvView from 'expo-libmpv';
import { Player } from 'snowstream'

// https://mpv.io/manual/master/#property-manipulation

export default function MpvVideoView(props) {
    const player = Player.useSnapshot(Player.state)

    const forwardRef = React.useRef(null);

    React.useEffect(() => {
        if (!player || !player.clientOptions) {
            return
        }
        if (!player.isVideoViewReady && forwardRef?.current?.runCommand) {
            if (player.clientOptions.audioCompression) {
                // Loudness normalization from Snowby
                forwardRef.current.runCommand(`set|af|acompressor=ratio=4,loudnorm`).catch(() => { })
            }
            else {
                forwardRef.current.runCommand(`set|del-af|@`).catch(() => { })
            }
            Player.action.onVideoReady()
        }
    })

    //TODO Read video FPS and resolution, pass into the view

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-scale|${player.subtitleFontScale}`).catch(() => { })
        }

    }, [player.subtitleFontScale])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`).catch(() => { })
            forwardRef.current.runCommand(`set|sub-color|${player.subtitleColor.shade}/${player.subtitleColor.alpha}`).catch(() => { })
        }
    }, [player.subtitleColor])

    React.useEffect(() => {
        if (player.audioDelay !== undefined && forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|audio-delay|${player.audioDelay}`).catch(() => { })
        }
    }, [player.audioDelay])

    React.useEffect(() => {
        if (player.subtitleDelay !== undefined && forwardRef.current?.runCommand && player.isVideoViewReady) {
            forwardRef.current.runCommand(`set|sub-delay|${player.subtitleDelay}`).catch(() => { })
        }
    }, [player.subtitleDelay])

    const eventHandler = React.useCallback((libmpvEvent) => {
        Player.action.onVideoUpdate({ kind: 'mpvevent', libmpvEvent })
    }, [])

    const logHandler = React.useCallback((libmpvLog) => {
        Player.action.onVideoUpdate({ kind: 'mpvlog', libmpvLog })
    }, [])

    if (!player || !player.clientOptions) {
        return null
    }

    return (
        <LibmpvView
            ref={forwardRef}
            playUrl={player.videoUrl}
            isPlaying={player.isPlaying}
            useHardwareDecoder={player.clientOptions?.hardwareDecoder}
            surfaceWidth={player.videoWidth}
            surfaceHeight={player.videoHeight}
            onLibmpvEvent={eventHandler}
            onLibmpvLog={logHandler}
            selectedAudioTrack={player.audioTrackIndex}
            selectedSubtitleTrack={player.subtitleTrackIndex}
            seekToSeconds={player.seekToSeconds}
        />
    )
}
