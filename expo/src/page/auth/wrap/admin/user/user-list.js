import AdminListPage from '../admin-list-page'

export default function UserListPage() {
    return (
        <AdminListPage
            kind="user"
            editPath={(routes) => { return routes.adminUserEdit }}
            editParams={(item) => { return { userId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getUserList() }}
            itemTitle={(item) => { return item.username || item.display_name }}
        />
    )
}