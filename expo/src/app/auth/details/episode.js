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
                <C.SnowTextButton key="season" title={`Season ${localParams.seasonOrder} `}
                    onPress={routes.func(routes.episodeList, episodeListPayload)}
                />,
                <C.SnowTextButton key="show" title={localParams.showName}
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
}
