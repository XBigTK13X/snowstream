import { C, Player } from 'snowstream'
import SnowVideoPlayer from '../../../comp/snow-video-player'

export function PlayMediaPage(props) {
    const player = Player.useSnapshot(Player.state)

    C.React.useEffect(() => {
        Player.action.effectSetVideoHandlers(
            props
        )
    }, [])

    if (player.playbackFailed) {
        return (
            <>
                <C.SnowText>Unable to play the video.</C.SnowText>
                <C.SnowText>Error: {C.Snow.stringifySafe(player.playbackFailed)}</C.SnowText>
            </>
        )
    }

    if (!player.videoUrl) {
        if (player.isTranscode) {
            return <C.SnowText>Preparing a transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        }
        return <C.SnowText>Loading video. This should only take a moment.</C.SnowText>
    }

    return (
        <SnowVideoPlayer />
    )
}

export default PlayMediaPage