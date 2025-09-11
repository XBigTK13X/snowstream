import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function MovieListPage() {
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getMovieList(shelfId, showPlaylisted)
    }

    const toggleShowPlaylisted = (routes, shelfId, showPlaylisted) => {
        return routes.replace(routes.movieList, { shelfId: shelfId, showPlaylisted })
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
