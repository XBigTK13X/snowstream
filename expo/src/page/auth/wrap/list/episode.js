import { useAppContext } from 'snowstream'

import { WatchableListPage } from './watchable-list'

export default function EpisodeListPage() {
    const { currentRoute } = useAppContext()
    const showName = currentRoute.routeParams.showName
    const seasonId = currentRoute.routeParams.seasonId
    const seasonOrder = currentRoute.routeParams.seasonOrder
    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} episodes for ${showName} season ${seasonOrder}`
    }
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getEpisodeList(shelfId, seasonId)
    }
    const scanContentsJob = (apiClient, shelfId) => {
        return apiClient.createJobShelvesScan({
            targetKind: 'season',
            targetId: seasonId
        })
    }
    const updateMediaJob = (apiClient, details) => {
        details.targetKind = 'season'
        details.targetId = seasonId
        details.seasonOrder = seasonOrder
        apiClient.createJobUpdateMediaFiles(details)
    }
    const watchAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, seasonId })
    }

    const shuffleAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, seasonId, shuffle: true })
    }
    return (
        <WatchableListPage
            getRemoteId={(item) => {
                if (!item) {
                    return null
                }
                return item.season.show.remote_metadata_id
            }}
            kind="Season"
            getPageTitle={getPageTitle}
            loadItems={loadItems}
            gridKind="screencap"
            scanContentsJob={scanContentsJob}
            updateMediaJob={updateMediaJob}
            watchAll={watchAll}
            shuffleAll={shuffleAll}
        />
    )
}
