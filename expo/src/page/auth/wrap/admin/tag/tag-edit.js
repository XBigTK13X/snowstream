import AdminFormPage from '../admin-form-page'

export default function TagEditPage() {
    return (
        <AdminFormPage
            kind="Tag"
            fields={[
                { label: 'Name', key: 'name' }

            ]}
            loadExisting={(apiClient, routeParams) => {
                if (!routeParams?.tagId) {
                    return new Promise(resolve => { resolve(null) })
                }
                return apiClient.getTag(routeParams?.tagId)
            }}
            saveItem={(apiClient, form) => {
                return apiClient.saveTag(form)
            }}
            deleteItem={(apiClient, form) => {
                return apiClient.deleteTag(form.id)
            }}
            listRoute={(routes) => {
                return routes.adminTagList
            }}
        />
    )
}