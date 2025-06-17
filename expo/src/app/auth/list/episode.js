import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function EpisodeListPage() {
    const localParams = C.useLocalSearchParams()
    const showName = localParams.showName
    const seasonId = localParams.seasonId
    const seasonOrder = localParams.seasonOrder
    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} episodes for ${showName} season ${seasonOrder}`
    }
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getEpisodeList(seasonId)
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleEpisodeWatchStatus(itemId)
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
    const watchAll = (apiClient) => {
        return apiClient.getPlayingQueue({ seasonId })
    }

    const shuffleAll = (apiClient) => {
        return apiClient.getPlayingQueue({ seasonId, shuffle: true })
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
            toggleItemWatched={toggleItemWatched}
            gridKind="screencap"
            scanContentsJob={scanContentsJob}
            updateMediaJob={updateMediaJob}
            watchAll={watchAll}
            shuffleAll={shuffleAll}
        />
    )
}
