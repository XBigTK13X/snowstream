import { C } from 'snowstream'

import { WatchableListPage } from './watchable-list'

export default function MovieListPage() {
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getMovieList(shelfId, showPlaylisted)
    }

    const toggleShowPlaylisted = (routes, navPush, shelfId, showPlaylisted) => {
        return navPush({ shelfId: shelfId, showPlaylisted })
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
            scanContentsJob={scanContentsJob}
        />
    )
}
