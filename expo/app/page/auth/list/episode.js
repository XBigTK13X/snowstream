import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function EpisodeListPage() {
    const localParams = C.useLocalSearchParams()
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const showName = localParams.showName
    const seasonId = localParams.seasonId
    const seasonOrder = localParams.seasonOrder
    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} episodes for ${showName} season ${seasonOrder}`
    }
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getEpisodeList(seasonId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.episodeList, { shelfId, showId, seasonId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId) => {
        let destination = { shelfId: shelfId, showId, seasonId, episodeId: itemId, showName, seasonOrder }
        routes.goto(routes.episodeDetails, destination)
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleEpisodeWatchStatus(itemId)
    }
    const updateMediaJob = (apiClient, shelfId, metadataId) => {
        apiClient.createJobUpdateMediaFiles('season', seasonId, metadataId)
    }
    return (
        <WatchableListPage
            getPageTitle={getPageTitle}
            loadItems={loadItems}
            refreshList={refreshList}
            gotoItem={gotoItem}
            toggleItemWatched={toggleItemWatched}
            gridKind="thumb"
            updateMediaJob={updateMediaJob}
        />
    )
}
