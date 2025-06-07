import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [targetKind, setTargetKind] = C.React.useState('')
    const [targetId, setTargetId] = C.React.useState('')
    const [targetDirectory, setTargetDirectory] = C.React.useState('')
    const [metadataId, setMetadataId] = C.React.useState('')
    const [metadataSource, setMetadataSource] = C.React.useState('')
    const [seasonOrder, setSeasonOrder] = C.React.useState('')
    const [episodeOrder, setEpisodeOrder] = C.React.useState('')
    const [updateImages, setUpdateImages] = C.React.useState('')
    const [updateMetadata, setUpdateMetadata] = C.React.useState('')

    const createJob = (apiCall) => {
        let details = {
            targetKind,
            targetId,
            targetDirectory,
            metadataId,
            metadataSource,
            seasonOrder,
            episodeOrder,
            updateImages,
            updateMetadata
        }
        return apiCall(details)
    }

    const buttons = [
        { name: 'Scan Shelves', apiCall: apiClient.createJobShelvesScan }, ,
        { name: 'Refresh Streamables', apiCall: apiClient.createJobStreamSourcesRefresh },
        { name: 'Read Media Files', apiCall: apiClient.createJobReadMediaFiles },
        { name: 'Update Media Files', apiCall: apiClient.createJobUpdateMediaFiles },
        { name: 'Identify Unknown Media', apiCall: apiClient.createJobIdentifyUnknownMedia }
    ]

    const renderItem = (item) => {
        return <C.SnowTextButton
            title={item.name}
            onPress={() => {
                createJob(item.apiCall).then(job => {
                    routes.goto(routes.admin.jobDetails, { jobId: job.id })
                })
            }}
        />
    }

    return (
        <C.View>
            <C.SnowGrid items={buttons} renderItem={renderItem} />
            <C.SnowGrid itemsPerRow={4}>
                <C.SnowLabel>Target Kind</C.SnowLabel>
                <C.SnowInput onChangeText={setTargetKind} value={targetKind} />
                <C.SnowLabel>Target Id</C.SnowLabel>
                <C.SnowInput onChangeText={setTargetId} value={targetId} />
                <C.SnowLabel>Target Directory</C.SnowLabel>
                <C.SnowInput onChangeText={setTargetDirectory} value={targetDirectory} />
                <C.SnowLabel>Metadata Id</C.SnowLabel>
                <C.SnowInput onChangeText={setMetadataId} value={metadataId} />
                <C.SnowLabel>Metadata Source</C.SnowLabel>
                <C.SnowInput onChangeText={setMetadataSource} value={metadataSource} />
                <C.SnowLabel>Season Order</C.SnowLabel>
                <C.SnowInput onChangeText={setSeasonOrder} value={seasonOrder} />
                <C.SnowLabel>Episode Order</C.SnowLabel>
                <C.SnowInput onChangeText={setEpisodeOrder} value={episodeOrder} />
                <C.SnowLabel>Update Images</C.SnowLabel>
                <C.SnowInput onChangeText={setUpdateImages} value={updateImages} />
                <C.SnowLabel>Update Metadata</C.SnowLabel>
                <C.SnowInput onChangeText={setUpdateMetadata} value={updateMetadata} />
            </C.SnowGrid>
        </C.View>
    )
}
