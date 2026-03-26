import AdminListPage from '../admin-list-page'

export default function CleanupRuleListPage() {
    return (
        <AdminListPage
            kind="cleanup rule"
            editPath={(routes) => { return routes.adminCleanupRuleEdit }}
            editParams={(item) => { return { ruleId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getDisplayCleanupRuleList() }}
            itemTitle={(item) => {
                return `${item.needle} -> ${item.replacement}`
            }}
        />
    )
}
