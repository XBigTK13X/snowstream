import AdminListPage from '../admin-list-page'

export default function TagListPage() {
    return (
        <AdminListPage
            kind="tag"
            editPath={(routes) => { return routes.adminTagEdit }}
            editParams={(item) => { return { tagId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getTagList() }}
        />
    )
}