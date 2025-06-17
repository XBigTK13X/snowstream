import { WatchableListPage } from './watchable-list'

export default function ShowListPage() {
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getShowList(shelfId, showPlaylisted)
    }
    const toggleShowPlaylisted = (routes, shelfId, showPlaylisted) => {
        return routes.replace(routes.showList, { shelfId: shelfId, showPlaylisted })
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
    return (
        <WatchableListPage
            kind="Shelf"
            loadItems={loadItems}
            toggleShowPlaylisted={toggleShowPlaylisted}
            toggleItemWatched={toggleItemWatched}
            scanContentsJob={scanContentsJob}
        />
    )
}
