import C from '../../../common'

styles = {
    columns: {
        flexBasis: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1
    },
}

export default function EpisodeDetailsPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)

    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    const episodeId = localParams.episodeId
    const seasonOrder = localParams.seasonOrder
    const showName = localParams.showName

    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!episode) {
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
                if (response.tracks.inspection.scored_tracks['audio'].length) {
                    setAudioTrack(response.tracks.inspection.scored_tracks['audio'][0].relative_index)
                }
                if (response.tracks.inspection.scored_tracks['subtitle'].length) {
                    setSubtitleTrack(response.tracks.inspection.scored_tracks['subtitle'][0].relative_index)
                }
            })
        }
    })
    const setWatchStatus = (status) => {
        apiClient.setEpisodeWatchStatus(episodeId, !episode.watched).then(() => {
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
            })
        })
    }
    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            setAudioTrack(track.relative_index)
        }
        if (track.kind === 'subtitle') {
            setSubtitleTrack(track.relative_index)
        }
    }
    if (shelf && episode) {
        const watchTitle = episode.watched ? 'Set Status to Unwatched' : 'Set Status to Watched'
        return (
            <C.View>
                <C.SnowText>
                    {showName} season {seasonOrder} episode {C.util.formatEpisodeTitle(episode)}
                </C.SnowText>
                <C.SnowButton
                    title="Play"
                    onPress={routes.func(routes.playMedia, {
                        videoFileIndex: 0,
                        audioTrack: audioTrack,
                        subtitleTrack: subtitleTrack,
                        episodeId: episodeId,
                        shelfId: shelfId
                    })}
                />
                <C.SnowButton title={watchTitle} onLongPress={setWatchStatus} />
                <C.SnowTrackSelector
                    tracks={episode.tracks.inspection.scored_tracks}
                    selectTrack={selectTrack}
                    audioTrack={audioTrack}
                    subtitleTrack={subtitleTrack}
                />
            </C.View>
        )
    }
    return <C.Text>Loading episode {episodeId}.</C.Text>
}
