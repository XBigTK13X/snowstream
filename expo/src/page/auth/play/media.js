import { C, Player } from 'snowstream'

export function PlayMediaPage(props) {
    const player = Player.useSnapshot(Player.state)

    C.React.useEffect(() => {
        Player.action.setup({
            loadVideo: props.loadVideo,
            loadTranscode: props.loadTranscode,
            onComplete: props.onComplete,
            updateProgress: props.updateProgress,
            increaseWatchCount: props.increaseWatchCount
        })
    }, [])

    if (player.playbackFailed) {
        return (
            <C.View>
                <C.SnowText>Unable to play the video.</C.SnowText>
                <C.SnowText>Error: {JSON.stringify(player.info.playbackFailed)}</C.SnowText>
            </C.View>
        )
    }

    if (!player.videoUrl) {
        if (player.isTranscode) {
            return <C.SnowText>Preparing a transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        }
        return <C.SnowText>Loading video. This should only take a moment.</C.SnowText>
    }

    return (
        // It gets cleaned up by the video player modal
        <C.SnowVideoPlayer skipCleanup />
    )
}

export default PlayMediaPage