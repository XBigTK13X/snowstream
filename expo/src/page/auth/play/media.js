import { C, PlayerContextProvider, usePlayerContext } from 'snowstream'

export function InnerPlayMediaPage(props) {
    const player = usePlayerContext()

    if (player.info.playbackFailed) {
        return (
            <C.View>
                <C.SnowText>Unable to play the video.</C.SnowText>
                <C.SnowText>Error: {JSON.stringify(player.info.playbackFailed)}</C.SnowText>
            </C.View>
        )
    }

    if (!player.info.videoUrl) {
        if (player.info.isTranscode) {
            return <C.SnowText>Preparing a transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        }
        return <C.SnowText>Loading video. This should only take a moment.</C.SnowText>
    }
    return (
        // It gets cleaned up by the video player modal
        <C.SnowVideoPlayer skipCleanup />
    )
}

export function PlayMediaPage(props) {
    return (
        <PlayerContextProvider
            loadVideo={props.loadVideo}
            loadTranscode={props.loadTranscode}
            onComplete={props.onComplete}
            updateProgress={props.updateProgress}
            increaseWatchCount={props.increaseWatchCount} >
            <InnerPlayMediaPage />
        </PlayerContextProvider>
    )

}

export default PlayMediaPage