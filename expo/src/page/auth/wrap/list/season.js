import { useAppContext } from 'snowstream'

import { WatchableListPage } from './watchable-list'

export default function SeasonListPage() {
    const { currentRoute } = useAppContext()

    const showId = currentRoute.routeParams.showId
    const showName = currentRoute.routeParams.showName

    const getPageTitle = (shelf, items) => {
        return `Found ${items.length} seasons for show ${showName}`
    }

    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getSeasonList(showId)
    }

    const scanContentsJob = (apiClient, shelfId) => {
        return apiClient.createJobShelvesScan({
            targetKind: 'show',
            targetId: showId
        })
    }
    const updateMediaJob = (apiClient, details) => {
        details.targetKind = 'show'
        details.targetId = showId
        apiClient.createJobUpdateMediaFiles(details)
    }

    const watchAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, showId })
    }

    const shuffleAll = (apiClient, shelfId) => {
        return apiClient.getPlayingQueue({ shelfId, showId, shuffle: true })
    }

    return (
        <WatchableListPage
            getRemoteId={(item) => {
                if (!item) {
                    return null
                }
                return item.show.remote_metadata_id
            }}
            kind="Show"
            getPageTitle={getPageTitle}
            loadItems={loadItems}
            scanContentsJob={scanContentsJob}
            updateMediaJob={updateMediaJob}
            watchAll={watchAll}
            shuffleAll={shuffleAll}
        />
    )
}
