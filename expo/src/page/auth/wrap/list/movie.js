import { C } from 'snowstream'

import { WatchableListPage } from './watchable-list'

export default function MovieListPage() {
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getMovieList(shelfId, showPlaylisted)
    }

    const toggleShowPlaylisted = (routes, navPush, shelfId, showPlaylisted) => {
        return navPush({ shelfId: shelfId, showPlaylisted })
    }

    const getJobTarget = (shelfId) => {
        return {
            targetKind: 'shelf',
            targetId: shelfId
        }
    }
    return (
        <WatchableListPage
            kind="Shelf"
            loadItems={loadItems}
            toggleShowPlaylisted={toggleShowPlaylisted}
            getJobTarget={getJobTarget}
        />
    )
}
