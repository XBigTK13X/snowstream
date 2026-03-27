import AdminFormPage from '../admin-form-page'

import Snow from 'expo-snowui'

const kinds = [
    'IptvEpg',
    'SchedulesDirect'
]

export default function GuideSourceEditPage() {
    return (
        <AdminFormPage
            kind="Guide Source"
            fields={[
                { label: 'Name', key: 'name' },
                { label: 'Kind', key: 'kind', input: 'dropdown', options: kinds },
                { label: 'URL', key: 'url' },
                { label: 'Username', key: 'username' },
                { label: 'Password', key: 'password' }
            ]}
            loadExisting={(apiClient, routeParams) => {
                if (!routeParams?.guideSourceId) {
                    return new Promise(resolve => { resolve(null) })
                }
                return apiClient.getChannelGuideSource(routeParams?.guideSourceId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveChannelGuideSource(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteChannelGuideSource(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminChannelGuideSourceList
            }}
            editButtons={(routes, currentRoute, navPush) => {
                return (
                    <Snow.TextButton title="Channels" onPress={navPush({
                        path: routes.adminChannelsEdit,
                        params: { guideSourceId: currentRoute?.routeParams?.guideSourceId }
                    })} />
                )
            }}
        />
    )
}
