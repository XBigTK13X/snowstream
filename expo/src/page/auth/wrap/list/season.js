
import { C } from 'snowstream'

import { WatchableListPage } from './watchable-list'

export default function SeasonListPage() {
    const { currentRoute } = C.useSnowContext()

    const showId = currentRoute.routeParams.showId
    const showName = currentRoute.routeParams.showName

    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} seasons for show ${showName ?? ''}`
    }

    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getSeasonList(showId)
    }

    const getJobTarget = () => {
        return {
            targetKind: 'show',
            targetId: showId
        }
    }

    const watchAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, showId })
    }

    const shuffleAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, showId, shuffle: true })
    }

    const getRemoteId = (item) => {
        if (!item) {
            return null
        }

        return item.show.remote_metadata_id
    }

    return (
        <WatchableListPage
            getRemoteId={getRemoteId}
            kind="Show"
            getPageTitle={getPageTitle}
            loadItems={loadItems}
            getJobTarget={getJobTarget}
            watchAll={watchAll}
            shuffleAll={shuffleAll}
        />
    )
}
