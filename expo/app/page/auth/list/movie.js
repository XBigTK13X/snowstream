import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function MovieListPage() {
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getMovieList(shelfId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.movieList, { shelfId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId) => {
        routes.goto(routes.movieDetails, { shelfId, movieId: itemId })
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleMovieWatchStatus(itemId)
    }
    const updateMediaJob = (apiClient, shelfId) => {
        apiClient.createJobUpdateMediaFiles('shelf', shelfId)
    }
    return (
        <WatchableListPage
            loadItems={loadItems}
            refreshList={refreshList}
            gotoItem={gotoItem}
            toggleItemWatched={toggleItemWatched}
            updateMediaJob={updateMediaJob}
        />
    )
}
