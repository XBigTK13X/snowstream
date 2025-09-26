import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const [form, setForm] = C.React.useState({
        episodeOrder: localParams.episodeOrder ?? '',
        extractOnly: localParams.extractOnly ?? '',
        metadataId: localParams.metadataId ?? '',
        metadataSource: localParams.metadataSource ?? '',
        seasonOrder: localParams.seasonOrder ?? '',
        skipExisting: localParams.skipExisting ?? '',
        targetDirectory: localParams.targetDirectory ?? '',
        targetId: localParams.targetId ?? '',
        targetKind: localParams.targetKind ?? '',
        updateImages: localParams.updateImages ?? '',
        updateMetadata: localParams.updateMetadata ?? '',
        updateVideos: localParams.updateVideos ?? '',
    })

    const createJob = (apiCall) => {
        let params = {}
        if (form.episodeOrder !== '') {
            params.episodeOrder = form.episodeOrder
        }
        if (form.extractOnly !== '') {
            params.extractOnly = form.extractOnly
        }
        if (form.metadataId !== '') {
            params.metadataId = form.metadataId
        }
        if (form.metadataSource !== '') {
            params.metadataSource = form.metadataSource
        }
        if (form.seasonOrder !== '') {
            params.seasonOrder = form.seasonOrder
        }
        if (form.skipExisting !== '') {
            params.skipExisting = form.skipExisting
        }
        if (form.targetDirectory !== '') {
            params.targetDirectory = form.targetDirectory
        }
        if (form.targetId !== '') {
            params.targetId = form.targetId
        }
        if (form.targetKind !== '') {
            params.targetKind = form.targetKind
        }
        if (form.updateImages !== '') {
            params.updateImages = form.updateImages
        }
        if (form.updateMetadata !== '') {
            params.updateMetadata = form.updateMetadata
        }
        if (form.updateVideos !== '') {
            params.updateVideos = form.updateVideos
        }
        routes.replace(routes.admin.jobRunner, params)
        let details = {
            episodeOrder: form.episodeOrder,
            extractOnly: form.extractOnly,
            metadataId: form.metadataId,
            metadataSource: form.metadataSource,
            seasonOrder: form.seasonOrder,
            skipExisting: form.skipExisting,
            targetDirectory: form.targetDirectory,
            targetId: form.targetId,
            targetKind: form.targetKind,
            updateImages: form.updateImages,
            updateMetadata: form.updateMetadata,
            updateVideos: form.updateVideos,
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
        { name: 'Refresh Guide', apiCall: apiClient.createJobChannelGuideRefresh },
        { name: 'Refresh Streamables', apiCall: apiClient.createJobStreamSourcesRefresh },
        { name: 'Sanitize File Properties', apiCall: apiClient.createJobSanitizeFileProperties },
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

    const changeForm = (key) => {
        return (val) => {
            setForm((prev) => {
                let result = { ...prev }
                result[key] = val
                return result
            })
        }
    }

    return (
        <C.View>
            <C.SnowGrid
                itemsPerRow={4}
                items={buttons}
                renderItem={renderItem} />
            <C.SnowGrid itemsPerRow={1}>
                <C.SnowLabel>Target Directory</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetDirectory')} value={form.targetDirectory} />
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={6}>
                <C.SnowLabel>Target Kind</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetKind')} value={form.targetKind} />
                <C.SnowLabel>Target Id</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetId')} value={form.targetId} />
                <C.SnowLabel>Metadata Id</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('metadataId')} value={form.metadataId} />
                <C.SnowLabel>Metadata Source</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('metadataSource')} value={form.metadataSource} />
                <C.SnowLabel>Season Order</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('seasonOrder')} value={form.seasonOrder} />
                <C.SnowLabel>Episode Order</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('episodeOrder')} value={form.episodeOrder} />
                <C.SnowLabel>Update Images</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('updateImages')} value={form.updateImages} />
                <C.SnowLabel>Update Metadata</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('updateMetadata')} value={form.updateMetadata} />
                <C.SnowLabel>Update Videos</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('updateVideos')} value={form.updateVideos} />
                <C.SnowLabel>Skip Existing</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('skipExisting')} value={form.skipExisting} />
                <C.SnowLabel>Extract Only</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('extractOnly')} value={form.extractOnly} />
            </C.SnowGrid>
        </C.View>
    )
}
