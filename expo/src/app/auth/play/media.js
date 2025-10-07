import { C } from 'snowstream'

export function InnerPlayMediaPage(props) {
    const player = C.usePlayerContext()

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
        <C.SnowVideoPlayer />
    )
}

export function PlayMediaPage(props) {
    return (
        <C.PlayerContextProvider
            loadVideo={props.loadVideo}
            loadTranscode={props.loadTranscode}
            onComplete={props.onComplete}
            updateProgress={props.updateProgress}
            increaseWatchCount={props.increaseWatchCount} >
            <InnerPlayMediaPage />
        </C.PlayerContextProvider>
    )

}

export default PlayMediaPage