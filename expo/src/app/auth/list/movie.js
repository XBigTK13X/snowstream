import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function MovieListPage() {
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getMovieList(shelfId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.movieList, { shelfId, watchStatus })
    }

    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleMovieWatchStatus(itemId)
    }
    const scanContentsJob = (apiClient, shelfId) => {
        return apiClient.createJobShelvesScan({
            targetKind: 'shelf',
            targetId: shelfId
        })
    }
    const updateMediaJob = (apiClient, details) => {
        return apiClient.createJobUpdateMediaFiles({
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
            toggleItemWatched={toggleItemWatched}
            scanContentsJob={scanContentsJob}
        />
    )
}
