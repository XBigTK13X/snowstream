import C from '../../../common'

import { WatchableListPage } from './watchable-list'

export default function EpisodeListPage() {
    const localParams = C.useLocalSearchParams()
    const shelfId = localParams.shelfId
    const showId = localParams.showId
    const seasonId = localParams.seasonId
    const loadItems = (apiClient, shelfId, currentStatus) => {
        return apiClient.getEpisodeList(seasonId, currentStatus)
    }
    const refreshList = (routes, shelfId, watchStatus) => {
        routes.goto(routes.episodeList, { shelfId, showId, seasonId, watchStatus })
    }
    const gotoItem = (routes, shelfId, itemId) => {
        let destination = { shelfId: shelf.id, showId: showId, seasonId: seasonId, episodeId: itemId }
        routes.goto(routes.episodeDetails, destination)
    }
    const toggleItemWatched = (apiClient, itemId) => {
        return apiClient.toggleEpisodeWatchStatus(itemId)
    }
    return (
        <WatchableListPage
            loadItems={loadItems}
            refreshList={refreshList}
            gotoItem={gotoItem}
            toggleItemWatched={toggleItemWatched}
            gridKind="thumb"
        />
    )
}