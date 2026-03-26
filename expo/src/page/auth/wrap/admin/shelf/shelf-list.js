import { C, useAppContext } from 'snowstream'

import AdminListPage from '../admin-list-page'

export default function ShelfListPage() {
    return (
        <AdminListPage
            kind="shelf"
            editPath={(routes) => { return routes.adminShelfEdit }}
            editParams={(item) => { return { shelfId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getShelfList() }}
        />
    )
}
