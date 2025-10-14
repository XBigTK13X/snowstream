import React from 'react'
import Snow from 'expo-snowui'
// Don't want it being included outside of Android
// Don't trying importing it until first render
import { LibmpvVideo } from 'expo-libmpv'
import { useAppContext, Player } from 'snowstream'

// https://mpv.io/manual/master/#property-manipulation
export default function MpvVideoView(props) {
    const { clientOptions } = useAppContext()
    const player = Player.useSnapshot(Player.state)

    const forwardRef = React.useRef(null);

    React.useEffect(() => {
        if (!player.isReady && forwardRef.current?.runCommand) {
            if (clientOptions.useFastMpv) {
                try {
                    forwardRef.current.runCommand(`set|hwdec|mediacodec`).catch(() => { })
                    forwardRef.current.runCommand(`set|vo|gpu`).catch(() => { })
                    forwardRef.current.runCommand(`set|profile|fast`).catch(() => { })
                    forwardRef.current.runCommand(`set|gpu-context|android`).catch(() => { })
                    forwardRef.current.runCommand(`set|scale|bilinear`).catch(() => { })
                    forwardRef.current.runCommand(`set|dscale|bilinear`).catch(() => { })
                    forwardRef.current.runCommand(`set|interpolation|no`).catch(() => { })
                    forwardRef.current.runCommand(`set|video-sync|display-resample`).catch(() => { })
                    forwardRef.current.runCommand(`set|opengl-es|yes`).catch(() => { })
                    forwardRef.current.runCommand(`set|audio-buffer|0.2`).catch(() => { })
                    forwardRef.current.runCommand(`set|cache|yes`).catch(() => { })
                }
                catch { }
            }
            else {
                if (clientOptions.audioCompression) {
                    // Loudness normalization from Snowby
                    forwardRef.current.runCommand(`set|af|acompressor=ratio=4,loudnorm`).catch(() => { })
                }
            }
            Player.action.onVideoReady()
        }
    })

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.isReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`).catch(() => { })
            forwardRef.current.runCommand(`set|sub-font-size|${player.subtitleFontSize}`).catch(() => { })
        }

    }, [player.subtitleFontSize])

    React.useEffect(() => {
        if (forwardRef.current?.runCommand && player.isReady) {
            forwardRef.current.runCommand(`set|sub-ass-override|force`).catch(() => { })
            forwardRef.current.runCommand(`set|sub-color|${player.subtitleColor.shade}/${player.subtitleColor.alpha}`).catch(() => { })
        }
    }, [player.subtitleColor])

    React.useEffect(() => {
        if (player.audioDelay !== undefined && forwardRef.current?.runCommand && player.isReady) {
            forwardRef.current.runCommand(`set|audio-delay|${player.audioDelay}`).catch(() => { })
        }
    }, [player.audioDelay])

    React.useEffect(() => {
        if (player.subtitleDelay !== undefined && forwardRef.current?.runCommand && player.isReady) {
            forwardRef.current.runCommand(`set|sub-delay|${player.subtitleDelay}`).catch(() => { })
        }
    }, [player.subtitleDelay])

    // The Modal draws the video player above everything else in the app
    // The FillView ensures that if the surface doesn't take up the entire viewport, that the letter/pillar boxing is black
    // The Video element renders to a native Surface
    // The Overlay allows a user to tap/click select on a remote to pause
    return (
        <Snow.Modal
            transparent
            statusBarTranslucent
            navigationBarTranslucent
            wrapper={false}
            assignFocus={false}
            onRequestClose={() => {
                Player.action.onStopVideo()
            }}>
            <Snow.FillView style={{ backgroundColor: 'black' }} >
                <LibmpvVideo
                    ref={forwardRef}
                    playUrl={player.videoUrl}
                    isPlaying={player.isPlaying}
                    useHardwareDecoder={clientOptions.hardwareDecoder}
                    surfaceWidth={player.videoWidth}
                    surfaceHeight={player.videoHeight}
                    onLibmpvEvent={(libmpvEvent) => {
                        Player.action.onVideoUpdate({ kind: 'mpvevent', libmpvEvent })
                    }}
                    onLibmpvLog={(libmpvLog) => {
                        Player.action.onVideoUpdate({ kind: 'mpvlog', libmpvLog })
                    }}
                    selectedAudioTrack={player.audioTrackIndex}
                    selectedSubtitleTrack={player.subtitleTrackIndex}
                    seekToSeconds={player.seekToSeconds}
                />
            </Snow.FillView>
            <Snow.Overlay
                focusStart
                focusKey="mpv-video"
                focusLayer="mpv-video"
                onPress={Player.action.onPauseVideo}
            >
            </Snow.Overlay>
        </Snow.Modal >
    )
}
