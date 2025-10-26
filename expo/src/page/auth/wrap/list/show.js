import { WatchableListPage } from './watchable-list'

export default function ShowListPage() {
    const loadItems = (apiClient, shelfId, showPlaylisted) => {
        return apiClient.getShowList(shelfId, showPlaylisted)
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
