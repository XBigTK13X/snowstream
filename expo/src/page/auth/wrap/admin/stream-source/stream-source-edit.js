import AdminFormPage from '../admin-form-page'

import Snow from 'expo-snowui'

const kinds = [
    'HdHomeRun',
    'IptvM3u',
    'FrigateNvr',
    'TubeArchivist'
]

export default function StreamSourceEditPage() {
    return (
        <AdminFormPage
            kind="Shelf"
            fields={[
                { label: 'Name', key: 'name' },
                { label: 'Kind', key: 'kind', input: 'dropdown', options: kinds },
                { label: 'URL', key: 'url' },
                { label: 'Username', key: 'username' },
                { label: 'Password', key: 'password' }
            ]}
            loadExisting={(apiClient, routeParams) => {
                if (!routeParams?.streamSourceId) {
                    return new Promise(resolve => { resolve(null) })
                }
                return apiClient.getStreamSource(routeParams?.streamSourceId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveStreamSource(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteStreamSource(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminStreamSourceList
            }}
            editButtons={(routes, currentRoute, navPush) => {
                return (
                    <Snow.TextButton
                        title="Streamables"
                        onPress={navPush({
                            path: routes.adminStreamablesEdit,
                            params: { streamSourceId: currentRoute.routeParams.streamSourceId }
                        })} />
                )
            }}
        />
    )
}
