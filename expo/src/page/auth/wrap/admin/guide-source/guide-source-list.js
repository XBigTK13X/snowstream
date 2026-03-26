import AdminListPage from '../admin-list-page'

export default function GuideSourceListPage() {
    return (
        <AdminListPage
            kind="guide source"
            editPath={(routes) => { return routes.adminChannelGuideSourceEdit }}
            editParams={(item) => { return { guideSourceId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getChannelGuideSourceList() }}
        />
    )
}
