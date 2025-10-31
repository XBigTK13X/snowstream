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
            <C.FillView>
                <C.SnowHeader center>Unable to play the video.</C.SnowHeader>
                <C.SnowText>Error: {C.Snow.stringifySafe(player.playbackFailed)}</C.SnowText>
            </C.FillView>
        )
    }

    if (!player.videoUrl) {
        if (player.isTranscode) {
            return (
                <C.FillView>
                    <C.SnowHeader style={{ flex: 1 }} center>Preparing a transcode.</C.SnowHeader>
                    <C.SnowLabel style={{ flex: 1 }} center>This can take a while to load.</C.SnowLabel>
                </C.FillView>
            )
        }
        return (
            <C.FillView>
                <C.SnowHeader style={{ flex: 1 }} center>Getting the video.</C.SnowHeader>
                <C.SnowLabel style={{ flex: 1 }} center>This should only take a moment.</C.SnowLabel>
            </C.FillView>
        )
    }

    return (
        <SnowVideoPlayer />
    )
}

export default PlayMediaPage