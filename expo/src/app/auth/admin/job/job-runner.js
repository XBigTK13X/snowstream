import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const [episodeOrder, setEpisodeOrder] = C.React.useState(localParams.episodeOrder ?? '')
    const [extractOnly, setExtractOnly] = C.React.useState(localParams.extractOnly ?? '')
    const [metadataId, setMetadataId] = C.React.useState(localParams.metadataId ? localParams.metadataId : '')
    const [metadataSource, setMetadataSource] = C.React.useState(localParams.metadataSource ?? '')
    const [seasonOrder, setSeasonOrder] = C.React.useState(localParams.seasonOrder ?? '')
    const [skipExisting, setSkipExisting] = C.React.useState(localParams.skipExisting ?? '')
    const [targetDirectory, setTargetDirectory] = C.React.useState(localParams.targetDirectory ?? '')
    const [targetId, setTargetId] = C.React.useState(localParams.targetId ?? '')
    const [targetKind, setTargetKind] = C.React.useState(localParams.targetKind ?? '')
    const [updateImages, setUpdateImages] = C.React.useState(localParams.updateImages ?? '')
    const [updateMetadata, setUpdateMetadata] = C.React.useState(localParams.updateMetadata ?? '')
    const [updateVideos, setUpdateVideos] = C.React.useState(localParams.updateVideos ?? '')

    const createJob = (apiCall) => {
        let params = {}
        if (episodeOrder) {
            params.episodeOrder = episodeOrder
        }
        if (extractOnly) {
            params.extractOnly = extractOnly
        }
        if (metadataId) {
            params.metadataId = metadataId
        }
        if (metadataSource) {
            params.metadataSource = metadataSource
        }
        if (seasonOrder) {
            params.seasonOrder = seasonOrder
        }
        if (skipExisting) {
            params.skipExisting = skipExisting
        }
        if (targetDirectory) {
            params.targetDirectory = targetDirectory
        }
        if (targetId) {
            params.targetId = targetId
        }
        if (targetKind) {
            params.targetKind = targetKind
        }
        if (updateImages) {
            params.updateImages = updateImages
        }
        if (updateMetadata) {
            params.updateMetadata = updateMetadata
        }
        if (updateVideos) {
            params.updateVideos = updateVideos
        }
        routes.replace(routes.admin.jobRunner, params)
        let details = {
            episodeOrder,
            extractOnly,
            metadataId,
            metadataSource,
            seasonOrder,
            skipExisting,
            targetDirectory,
            targetId,
            targetKind,
            updateImages,
            updateMetadata,
            updateVideos,
        }
        return apiCall(details)
    }

    const buttons = [
        { name: 'Clean File Records', apiCall: apiClient.createJobCleanFileRecords },
        { name: 'Close Transcode Sessions', apiCall: apiClient.closeAllTranscodeSessions },
        { name: 'Delete Cached Text', apiCall: apiClient.deleteAllCachedText },
        { name: 'Delete Media Records', apiCall: apiClient.createJobDeleteMediaRecords },
        { name: 'Identify Unknown Media', apiCall: apiClient.createJobIdentifyUnknownMedia },
        { name: 'Read Media Files', apiCall: apiClient.createJobReadMediaFiles },
        { name: 'Refresh Streamables', apiCall: apiClient.createJobStreamSourcesRefresh },
        { name: 'Scan Shelves', apiCall: apiClient.createJobShelvesScan },
        { name: 'Update Media Files', apiCall: apiClient.createJobUpdateMediaFiles },
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
                itemsPerRow={4}
                items={buttons}
                renderItem={renderItem} />
            <C.SnowGrid shrink itemsPerRow={1}>
                <C.SnowLabel>Target Directory</C.SnowLabel>
                <C.SnowInput onValueChange={setTargetDirectory} value={targetDirectory} />
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={6}>
                <C.SnowLabel>Target Kind</C.SnowLabel>
                <C.SnowInput onValueChange={setTargetKind} value={targetKind} />
                <C.SnowLabel>Target Id</C.SnowLabel>
                <C.SnowInput onValueChange={setTargetId} value={targetId} />
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
                <C.SnowLabel>Extract Only</C.SnowLabel>
                <C.SnowInput onValueChange={setExtractOnly} value={extractOnly} />
            </C.SnowGrid>
        </C.FillView>
    )
}
