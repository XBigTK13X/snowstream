import AdminListPage from '../admin-list-page'

export default function TagRuleListPage() {
    return (
        <AdminListPage
            kind="tag rule"
            editPath={(routes) => { return routes.adminTagRuleEdit }}
            editParams={(item) => { return { ruleId: item.id } }}
            loadItems={(apiClient) => { return apiClient.getTagRuleList() }}
            itemTitle={(item) => {
                return `${item.target_kind} -> ${item.trigger_kind} == ${item.trigger_target} -> ${item.tag.name}`
            }}
        />
    )
}
