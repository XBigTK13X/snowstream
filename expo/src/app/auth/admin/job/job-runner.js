import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [targetKind, setTargetKind] = C.React.useState('')
    const [targetId, setTargetId] = C.React.useState('')
    const [targetDirectory, setTargetDirectory] = C.React.useState('')
    const [metadataId, setMetadataId] = C.React.useState('')
    const [metadataSource, setMetadataSource] = C.React.useState('')
    const [seasonOrder, setSeasonOrder] = C.React.useState('')
    const [episodeOrder, setEpisodeOrder] = C.React.useState('')
    const [updateImages, setUpdateImages] = C.React.useState('')
    const [updateMetadata, setUpdateMetadata] = C.React.useState('')
    const [updateVideos, setUpdateVideos] = C.React.useState('')
    const [skipExisting, setSkipExisting] = C.React.useState('')

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
            updateMetadata,
            updateVideos,
            skipExisting
        }
        return apiCall(details)
    }

    const buttons = [
        { name: 'Clean File Records', apiCall: apiClient.createJobCleanFileRecords },
        { name: 'Delete Media Records', apiCall: apiClient.createJobDeleteMediaRecords },
        { name: 'Identify Unknown Media', apiCall: apiClient.createJobIdentifyUnknownMedia },
        { name: 'Read Media Files', apiCall: apiClient.createJobReadMediaFiles },
        { name: 'Refresh Streamables', apiCall: apiClient.createJobStreamSourcesRefresh },
        { name: 'Scan Shelves', apiCall: apiClient.createJobShelvesScan },
        { name: 'Update Media Files', apiCall: apiClient.createJobUpdateMediaFiles },
        { name: 'Delete Cached Text', apiCall: apiClient.deleteAllCachedText }
    ]

    const renderItem = (item) => {
        return <C.SnowTextButton
            tall
            title={item.name}
            onPress={() => {
                createJob(item.apiCall).then(job => {
                    if (item.name !== 'Delete Cached Text') {
                        routes.goto(routes.admin.jobDetails, { jobId: job.id })
                    }
                })
            }}
        />
    }

    return (
        <C.FillView>
            <C.SnowGrid shrink
                itemsPerRow={7}
                items={buttons}
                renderItem={renderItem} />
            <C.SnowGrid itemsPerRow={6}>
                <C.SnowLabel>Target Kind</C.SnowLabel>
                <C.SnowInput onValueChange={setTargetKind} value={targetKind} />
                <C.SnowLabel>Target Id</C.SnowLabel>
                <C.SnowInput onValueChange={setTargetId} value={targetId} />
                <C.SnowLabel>Target Directory</C.SnowLabel>
                <C.SnowInput onValueChange={setTargetDirectory} value={targetDirectory} />
                <C.SnowLabel>Metadata Id</C.SnowLabel>
                <C.SnowInput onValueChange={setMetadataId} value={metadataId} />
                <C.SnowLabel>Metadata Source</C.SnowLabel>
                <C.SnowInput onValueChange={setMetadataSource} value={metadataSource} />
                <C.SnowLabel>Season Order</C.SnowLabel>
                <C.SnowInput onValueChange={setSeasonOrder} value={seasonOrder} />
                <C.SnowLabel>Episode Order</C.SnowLabel>
                <C.SnowInput onValueChange={setEpisodeOrder} value={episodeOrder} />
                <C.SnowLabel>Update Images</C.SnowLabel>
                <C.SnowInput onValueChange={setUpdateImages} value={updateImages} />
                <C.SnowLabel>Update Metadata</C.SnowLabel>
                <C.SnowInput onValueChange={setUpdateMetadata} value={updateMetadata} />
                <C.SnowLabel>Update Videos</C.SnowLabel>
                <C.SnowInput onValueChange={setUpdateVideos} value={updateVideos} />
                <C.SnowLabel>Skip Existing</C.SnowLabel>
                <C.SnowInput onValueChange={setSkipExisting} value={skipExisting} />
            </C.SnowGrid>
        </C.FillView>
    )
}
