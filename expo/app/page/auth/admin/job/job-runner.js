import C from '../../../../common'

export default function ShelfEditPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const localParams = C.useLocalSearchParams()

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
    }

    const buttons = [
        { name: 'Scan Shelves', kind: 'scan-shelves' }, ,
        { name: 'Refresh Streamables', kind: 'refresh-streams' },
        { name: 'Read Media Files', kind: 'read-media' }
    ]

    const renderItem = (item) => {
        return <C.SnowTextButton title={item.name} onPress={() => { createJob(item.kind) }} />
    }

    return (
        <C.SnowGrid data={buttons} renderItem={renderItem} />
    )
}
