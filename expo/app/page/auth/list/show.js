import { WatchableListPage } from './watchable-list'

export default function ShowListPage() {
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getShowList(shelfId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.showList, { shelfId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId, item) => {
        routes.goto(routes.seasonList, { shelfId, showId: itemId, showName: item.name })
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
        apiClient.createJobUpdateMediaFiles({
            targetKind: 'shelf',
            targetId: details.shelfId,
            metadataId: details.metadataId,
            updateMetadata: details.metadata,
            updateImages: details.images
        })
    }
    return (
        <WatchableListPage
            kind="Shelf"
            loadItems={loadItems}
            refreshList={refreshList}
            gotoItem={gotoItem}
            toggleItemWatched={toggleItemWatched}
            scanContentsJob={scanContentsJob}
        />
    )
}
