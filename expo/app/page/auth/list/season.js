import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function SeasonListPage() {
    const localParams = C.useLocalSearchParams()
    const showId = localParams.showId
    const showName = localParams.showName

    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} seasons for show ${showName}`
    }

    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getSeasonList(showId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.seasonList, { shelfId, showId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId, item) => {
        routes.goto(routes.episodeList, {
            shelfId,
            showId: showId,
            seasonId: itemId,
            showName: showName,
            seasonOrder: item.season_order_counter,
        })
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleSeasonWatchStatus(itemId)
    }

    const updateMediaJob = (apiClient, shelfId, metadataId) => {
        apiClient.createJobUpdateMediaFiles('show', showId, metadataId)
    }

    return (
        <WatchableListPage
            getPageTitle={getPageTitle}
            loadItems={loadItems}
            refreshList={refreshList}
            gotoItem={gotoItem}
            toggleItemWatched={toggleItemWatched}
            updateMediaJob={updateMediaJob}
        />
    )
}
