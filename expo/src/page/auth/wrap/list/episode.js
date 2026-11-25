import { C } from 'snowstream'

import { WatchableListPage } from './watchable-list'

export default function EpisodeListPage() {
    const { currentRoute } = C.useSnowContext()
    const showName = currentRoute.routeParams.showName
    const seasonId = currentRoute.routeParams.seasonId
    const seasonOrder = currentRoute.routeParams.seasonOrder

    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} episodes for ${showName ?? ''} season ${seasonOrder ?? ''}`
    }

    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getEpisodeList(shelfId, seasonId)
    }

    const getJobTarget = () => {
        return {
            targetKind: 'season',
            targetId: seasonId,
            seasonOrder: seasonOrder
        }
    }

    const watchAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, seasonId })
    }

    const shuffleAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, seasonId, shuffle: true })
    }
    const getRemoteId = (item) => {
        if (!item) {
            return null
        }
        return item.season.show.remote_metadata_id
    }

    const getRemoteSource = (item) => {
        if (!item) {
            return null
        }
        return item.season.show.remote_metadata_source
    }

    return (
        <WatchableListPage
            getRemoteId={getRemoteId}
            getRemoteSource={getRemoteSource}
            kind="Season"
            getPageTitle={getPageTitle}
            loadItems={loadItems}
            gridKind="screencap"
            getJobTarget={getJobTarget}
            watchAll={watchAll}
            shuffleAll={shuffleAll}
        />
    )
}
