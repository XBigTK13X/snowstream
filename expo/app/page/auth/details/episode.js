import C from '../../../common'

import MediaTracksPage from './media-tracks'

export default function EpisodeDetailsPage() {

    return <MediaTracksPage
        mediaKind="Episode"
        getMediaName={(localParams, media) => {
            return `${localParams.showName} season ${localParams.seasonOrder} episode ${C.util.formatEpisodeTitle(media)}`
        }}
        loadMedia={(apiClient, localParams) => {
            return apiClient.getEpisode(localParams.episodeId)
        }}
        toggleWatchStatus={(apiClient, localParams) => {
            return apiClient.toggleEpisodeWatchStatus(localParams.episodeId)
        }}
        gotoShelf={(routes, localParams) => {
            return routes.func(routes.showList, { shelfId: localParams.shelfId })
        }}
        getNavButtons={(routes, localParams) => {
            const episodeListPayload = {
                shelfId: localParams.shelfId,
                showId: localParams.showId,
                seasonId: localParams.seasonId,
                showName: localParams.showName,
                seasonOrder: localParams.seasonOrder,
            }
            const seasonListPayload = {
                shelfId: localParams.shelfId,
                showId: localParams.showId,
                showName: localParams.showName,
            }
            return [
                <C.SnowTextButton title={`Season ${localParams.seasonOrder} `}
                    onPress={routes.func(routes.episodeList, episodeListPayload)}
                />,
                <C.SnowTextButton title={localParams.showName}
                    onPress={routes.func(routes.seasonList, seasonListPayload)}
                />
            ]
        }}
        getPlayDestination={(localParams) => {
            return {
                episodeId: localParams.episodeId,
                showId: localParams.showId,
                seasonId: localParams.seasonId,
                showName: localParams.showName,
                seasonOrder: localParams.seasonOrder
            }
        }}
        getScanDetails={(localParams) => {
            return {
                targetKind: 'episode',
                targetId: localParams.episodeId
            }
        }}
        getUpdateMediaJobDetails={(localParams) => {
            return {
                targetKind: 'episode',
                targetId: localParams.episodeId
            }
        }}
    />
    const { isAdmin, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [episode, setEpisode] = C.React.useState(null)
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const [videoFile, setVideoFile] = C.React.useState(null)

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
            apiClient.getEpisode(episodeId).then((response) => {
                setEpisode(response)
                setVideoFile(response.video_files[0])
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
        apiClient.toggleEpisodeWatchStatus(episodeId).then(() => {
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
    if (shelf && episode && videoFile) {
        const watchTitle = episode.watched ? 'Set Status to Unwatched' : 'Set Status to Watched'
        const episodeListPayload = {
            shelfId,
            showId: episode.show.id,
            seasonId: episode.season.id,
            showName: showName,
            seasonOrder: episode.season.season_order_counter,
        }
        const seasonListPayload = { shelfId, showId, showName }
        return (
            <C.View>
                <C.SnowText>
                    {showName} season {seasonOrder} episode {C.util.formatEpisodeTitle(episode)}
                </C.SnowText>
                <C.SnowText>Path: {videoFile.network_path}</C.SnowText>
                <C.SnowText>Times Watched: {episode.watch_count ? episode.watch_count.amount : 0}</C.SnowText>
                <C.SnowGrid itemsPerRow={3}>
                    <C.SnowTextButton
                        title="Play"
                        onPress={routes.func(routes.playMedia, {
                            videoFileIndex: 0,
                            audioTrack: audioTrack,
                            subtitleTrack: subtitleTrack,
                            episodeId: episodeId,
                            shelfId: shelfId
                        })}
                    />
                    <C.SnowTextButton title={watchTitle} onLongPress={setWatchStatus} />
                    <C.SnowTextButton title={episode.season.name} onPress={routes.func(routes.episodeList, episodeListPayload)} />
                    <C.SnowTextButton title={episode.show.name} onPress={routes.func(routes.seasonList, seasonListPayload)} />
                    <C.SnowTextButton title={shelf.name} onPress={routes.func(routes.showList, { shelfId: shelf.id })} />
                    <C.SnowAdminButton title="Rescan Episode" onPress={() => {
                        return apiClient.createJobShelvesScan({
                            targetKind: 'episode',
                            targetId: episodeId
                        })
                    }} />
                    <C.SnowUpdateMediaButton
                        remoteId={episode.show.remote_metadata_id ? episode.show.remote_metadata_id : ''}
                        kind="Episode"
                        updateMediaJob={(details) => {
                            apiClient.createJobUpdateMediaFiles({
                                targetKind: 'episode',
                                targetId: episodeId,
                                metadataId: details.metadataId,
                                seasonOrder: seasonOrder,
                                updateMetadata: details.metadata,
                                updateImages: details.images
                            })
                        }} />
                </C.SnowGrid>
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
