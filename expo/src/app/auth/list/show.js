import { WatchableListPage } from './watchable-list'

export default function ShowListPage() {
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getShowList(shelfId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.showList, { shelfId, watchStatus })
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleShowWatchStatus(itemId)
    }
    const scanContentsJob = (apiClient, shelfId) => {
        return apiClient.createJobShelvesScan({
            targetKind: 'shelf',
            targetId: shelfId
        })
    }
    const updateMediaJob = (apiClient, details) => {
        details.targetKind = 'shelf'
        details.targetId = details.shelfId
        apiClient.createJobUpdateMediaFiles(details)
    }
    return (
        <WatchableListPage
            kind="Shelf"
            loadItems={loadItems}
            refreshList={refreshList}
            toggleItemWatched={toggleItemWatched}
            scanContentsJob={scanContentsJob}
        />
    )
}
