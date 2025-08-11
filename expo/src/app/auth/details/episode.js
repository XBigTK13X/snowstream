import C from '../../../common'

import MediaTracksPage from './media-tracks'

export default function EpisodeDetailsPage() {

    return (<MediaTracksPage
        mediaKind="Episode"
        getRemoteMetadataId={(media) => {
            return media.season.show.remote_metadata_id
        }}
        getMediaName={(localParams, media) => {
            return `${localParams.showName} - ${media.name}`
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
                <C.SnowTextButton tall key="show" title={localParams.showName}
                    onPress={routes.func(routes.seasonList, seasonListPayload)}
                />,
                <C.SnowTextButton tall key="season" title={`Season ${localParams.seasonOrder} `}
                    onPress={routes.func(routes.episodeList, episodeListPayload)}
                />
            ]
        }}
        getPlayDestination={(localParams) => {
            return {
                episodeId: localParams.episodeId,
                showId: localParams.showId,
                seasonId: localParams.seasonId,
                showName: localParams.showName,
                seasonOrder: localParams.seasonOrder,
                episodeOrder: localParams.episodeOrder
            }
        }}
        getScanDetails={(localParams) => {
            return {
                targetKind: 'episode',
                targetId: localParams.episodeId,
                seasonOrder: localParams.seasonOrder,
                episodeOrder: localParams.episodeOrder
            }
        }}
        getUpdateMediaJobDetails={(localParams) => {
            return {
                targetKind: 'episode',
                targetId: localParams.episodeId,
                seasonOrder: localParams.seasonOrder,
                episodeOrder: localParams.episodeOrder
            }
        }}
    />)
}
