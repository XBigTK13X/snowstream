import { C, useAppContext } from 'snowstream'

const kinds = ['Movies', 'Shows', 'Keepsakes']

import AdminFormPage from '../admin-form-page'

export default function ShelfEditPage() {
    return (
        <AdminFormPage
            kind="Shelf"
            fields={[
                { label: 'Name', key: 'name' },
                { label: 'Local Path', key: 'localPath', api: 'local_path' },
                { label: 'Network Path', key: 'networkPath', api: 'network_path' },
                { label: 'Kind', key: 'kind', input: 'dropdown', options: kinds }
            ]}
            loadExisting={(apiClient, routeParams) => {
                if (!routeParams?.shelfId) {
                    return new Promise(resolve => { resolve(null) })
                }
                return apiClient.getShelf(routeParams?.shelfId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveShelf(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteShelf(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminShelfList
            }}
        />
    )
}
