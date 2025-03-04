import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function SeasonListPage() {
    const localParams = C.useLocalSearchParams()
    const showId = localParams.showId
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getSeasonList(showId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.seasonList, { shelfId, showId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId) => {
        routes.goto(routes.episodeList, { shelfId, showId: showId, seasonId: itemId })
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleSeasonWatchStatus(itemId)
    }
    return (
        <WatchableListPage
            loadItems={loadItems}
            refreshList={refreshList}
            gotoItem={gotoItem}
            toggleItemWatched={toggleItemWatched}
        />
    )
}