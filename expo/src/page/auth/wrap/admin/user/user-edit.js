import AdminFormPage from '../admin-form-page'

import Snow from 'expo-snowui'

export default function UserEditPage() {
    return (
        <AdminFormPage
            kind="User"
            fields={[
                { label: 'Name', key: 'name' },
                { label: 'Password', key: 'password', note: '"SNOWSTREAM_EMPTY" to make no password for non-admin' },
                { label: 'Display Name', key: 'displayName', api: 'display_name' },
                { label: 'Enabled', key: 'enabled' },
                { label: 'Permissions', key: 'permissions' },

            ]}
            loadExisting={(apiClient, routeParams) => {
                if (!routeParams?.guideSourceId) {
                    return new Promise(resolve => { resolve(null) })
                }
                return apiClient.getUser(routeParams?.userId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveUser(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteUser(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminUserList
            }}
            editButtons={(routes, currentRoute, navPush) => {
                return (
                    <>
                        <Snow.TextButton title="User Details" onPress={navPush({
                            path: routes.adminUserEdit,
                            params: { userId: currentRoute?.routeParams?.userId }
                        })} />
                        <Snow.TextButton title="User Access" onPress={navPush({
                            path: routes.adminUserAccess,
                            params: { userId: currentRoute?.routeParams?.userId }
                        })} />
                    </>
                )
            }}
        />
    )
}