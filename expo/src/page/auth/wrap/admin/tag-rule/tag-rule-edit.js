import AdminFormPage from '../admin-form-page'

const targetKinds = [
    'All',
    'TubeArchivist',
    'Frigate NVR',
    'HDHomeRun',
    'IPTV M3U',
    'Shelf'
]

const ruleKinds = [
    'apply'
]

const triggerKinds = [
    'group',
]

export default function TagRuleEditPage() {
    return (
        <AdminFormPage
            kind="Tag Rule"
            fields={[
                { label: 'Tag Name', key: 'tagName', api: 'tag_name' },
                { label: 'Rule Kind', key: 'ruleKind', api: 'rule_kind', options: ruleKinds, input: 'dropdown' },
                { label: 'Target Kind', key: 'targetKind', api: 'target_kind', options: targetKinds, input: 'dropdown' },
                { label: 'Trigger Kind', key: 'triggerKind', api: 'trigger_kind', options: triggerKinds, input: 'dropdown' },
                { label: 'Trigger Target', key: 'triggerTarget', api: 'trigger_target' },
                {
                    label: 'Priority', key: 'priority', empty: (item) => {
                        if (item.priority !== '') {
                            return parseInt(item.priority, 10)
                        }
                        return null
                    }
                },

            ]}
            loadExisting={(apiClient, routeParams) => {
                if (!routeParams?.ruleId) {
                    return new Promise(resolve => { resolve(null) })
                }
                return apiClient.getTagRule(routeParams?.ruleId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveTagRule(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteTagRule(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminTagRuleList
            }}
        />
    )
}