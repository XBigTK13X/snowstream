import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useSession()
    const { routes, config } = C.useSettings()

    const createJob = (kind) => {
        if (kind === 'refresh-streams') {
            return apiClient.createJobStreamSourcesRefresh()
        }
        if (kind === 'scan-shelves') {
            return apiClient.createJobShelvesScan()
        }
        if (kind === 'read-media') {
            return apiClient.createJobReadMediaFiles()
        }
        if (kind === 'update-media') {
            return apiClient.createJobUpdateMediaFiles()
        }
        if (kind === 'identify-media') {
            return apiClient.createJobIdentifyUnknownMedia()
        }
    }

    const buttons = [
        { name: 'Scan Shelves', kind: 'scan-shelves' }, ,
        { name: 'Refresh Streamables', kind: 'refresh-streams' },
        { name: 'Read Media Files', kind: 'read-media' },
        { name: 'Update Media Files', kind: 'update-media' },
        { name: 'Identify Unknown Media', kind: 'identify-media' }
    ]

    const renderItem = (item) => {
        return <C.SnowTextButton
            title={item.name}
            onPress={() => {
                createJob(item.kind).then(job => {
                    routes.goto(routes.admin.jobDetails, { jobId: job.id })
                })
            }}
        />
    }

    return (
        <C.SnowGrid items={buttons} renderItem={renderItem} />
    )
}
