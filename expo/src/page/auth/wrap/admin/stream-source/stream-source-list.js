import AdminListPage from '../admin-list-page'

export default function StreamSourceListPage() {
    return (
        <AdminListPage
            kind="stream source"
            editPath={(routes) => { return routes.adminStreamSourceEdit }}
            editParams={(item) => { return { streamSourceId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getStreamSourceList() }}
        />
    )
}