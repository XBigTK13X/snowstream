import C from '../../../common'
import { WatchableListPage } from './watchable-list'

export default function ShowListPage() {
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getShowList(shelfId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.showList, { shelfId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId) => {
        routes.goto(routes.seasonList, { shelfId, showId: itemId })
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleShowWatchStatus(itemId)
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
