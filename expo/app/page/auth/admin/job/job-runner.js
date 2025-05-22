import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useSession()

    const createJob = (kind) => {
        if (kind === 'refresh-streams') {
            apiClient.createJobStreamSourcesRefresh()
        }
        if (kind === 'scan-shelves') {
            apiClient.createJobShelvesScan()
        }
        if (kind === 'read-media') {
            apiClient.createJobReadMediaFiles()
        }
        if (kind === 'update-media') {
            apiClient.createJobUpdateMediaFiles()
        }
    }

    const buttons = [
        { name: 'Scan Shelves', kind: 'scan-shelves' }, ,
        { name: 'Refresh Streamables', kind: 'refresh-streams' },
        { name: 'Read Media Files', kind: 'read-media' },
        { name: 'Update Media Files', kind: 'update-media' }
    ]

    const renderItem = (item) => {
        return <C.SnowTextButton title={item.name} onPress={() => { createJob(item.kind) }} />
    }

    return (
        <C.SnowGrid items={buttons} renderItem={renderItem} />
    )
}
