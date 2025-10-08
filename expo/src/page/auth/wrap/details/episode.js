import { C } from 'snowstream'

import MediaTracksPage from './media-tracks'

export default function EpisodeDetailsPage() {

    return (
        <MediaTracksPage
            mediaKind="Episode"
            getRemoteMetadataId={(media) => {
                return media.season.show.remote_metadata_id
            }}
            getMediaName={(routeParams, media) => {
                return `${routeParams.showName} - ${media.name}`
            }}
            loadMedia={(apiClient, routeParams, deviceProfile) => {
                return apiClient.getEpisode(routeParams.episodeId, deviceProfile)
            }}
            toggleWatchStatus={(apiClient, routeParams) => {
                return apiClient.toggleEpisodeWatchStatus(routeParams.episodeId)
            }}
            gotoShelf={(routes, navPush, routeParams) => {
                return navPush(routes.showList, { shelfId: routeParams.shelfId }, true)
            }}
            getNavButtons={(routes, navPush, routeParams) => {
                const episodeListPayload = {
                    shelfId: routeParams.shelfId,
                    showId: routeParams.showId,
                    seasonId: routeParams.seasonId,
                    showName: routeParams.showName,
                    seasonOrder: routeParams.seasonOrder,
                }
                const seasonListPayload = {
                    shelfId: routeParams.shelfId,
                    showId: routeParams.showId,
                    showName: routeParams.showName,
                }
                return [
                    <C.SnowTextButton tall key="show" title={routeParams.showName}
                        onPress={navPush(routes.seasonList, seasonListPayload, true)}
                    />,
                    <C.SnowTextButton tall key="season" title={`Season ${routeParams.seasonOrder} `}
                        onPress={navPush(routes.episodeList, episodeListPayload, true)}
                    />
                ]
            }}
            getPlayRoute={(routes) => {
                return routes.episodePlay
            }}
            getPlayParameters={(routeParams) => {
                return {
                    episodeId: routeParams.episodeId,
                    showId: routeParams.showId,
                    seasonId: routeParams.seasonId,
                    showName: routeParams.showName,
                    seasonOrder: routeParams.seasonOrder,
                    episodeOrder: routeParams.episodeOrder
                }
            }}
            getScanDetails={(routeParams) => {
                return {
                    targetKind: 'episode',
                    targetId: routeParams.episodeId,
                    seasonOrder: routeParams.seasonOrder,
                    episodeOrder: routeParams.episodeOrder
                }
            }}
            getUpdateMediaJobDetails={(routeParams) => {
                return {
                    targetKind: 'episode',
                    targetId: routeParams.episodeId,
                    seasonOrder: routeParams.seasonOrder,
                    episodeOrder: routeParams.episodeOrder
                }
            }}
        />
    )
}
