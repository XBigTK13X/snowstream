import AdminFormPage from '../admin-form-page'

const targetKinds = [
    'All',
    'TubeArchivist',
    'Frigate NVR',
    'HDHomeRun',
    'IPTV M3U'
]

const ruleKinds = [
    'apply'
]

export default function DisplayCleanupRuleEditPage() {
    return (
        <AdminFormPage
            kind="Display Cleanup Rule"
            fields={[
                { label: 'Needle', key: 'needle' },
                { label: 'Replacement', key: 'replacement' },
                { label: 'Rule Kind', key: 'ruleKind', api: 'rule_kind', options: ruleKinds, input: 'dropdown' },
                { label: 'Target Kind', key: 'targetKind', api: 'target_kind', options: targetKinds, input: 'dropdown' },
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
                return apiClient.getDisplayCleanupRule(routeParams?.ruleId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveDisplayCleanupRule(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteDisplayCleanupRule(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminCleanupRuleList
            }}
        />
    )
}