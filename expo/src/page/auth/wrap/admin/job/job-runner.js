import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

export default function ShelfEditPage() {
    const { navPush, currentRoute } = Snow.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [form, setForm] = C.React.useState({
        episodeOrder: currentRoute.routeParams.episodeOrder ?? '',
        extractOnly: currentRoute.routeParams.extractOnly ?? '',
        metadataId: currentRoute.routeParams.metadataId ?? '',
        metadataSource: currentRoute.routeParams.metadataSource ?? '',
        seasonOrder: currentRoute.routeParams.seasonOrder ?? '',
        skipExisting: currentRoute.routeParams.skipExisting ?? '',
        targetDirectory: currentRoute.routeParams.targetDirectory ?? '',
        targetId: currentRoute.routeParams.targetId ?? '',
        targetKind: currentRoute.routeParams.targetKind ?? '',
        updateImages: currentRoute.routeParams.updateImages ?? '',
        updateMetadata: currentRoute.routeParams.updateMetadata ?? '',
        updateVideos: currentRoute.routeParams.updateVideos ?? '',
    })
    const formRef = C.React.useRef(form)

    C.React.useEffect(() => {
        formRef.current = form
    })

    const createJob = (apiCall) => {
        let params = {}
        if (formRef.current.episodeOrder !== '') {
            params.episodeOrder = formRef.current.episodeOrder
        }
        if (formRef.current.extractOnly !== '') {
            params.extractOnly = formRef.current.extractOnly
        }
        if (formRef.current.metadataId !== '') {
            params.metadataId = formRef.current.metadataId
        }
        if (formRef.current.metadataSource !== '') {
            params.metadataSource = formRef.current.metadataSource
        }
        if (formRef.current.seasonOrder !== '') {
            params.seasonOrder = formRef.current.seasonOrder
        }
        if (formRef.current.skipExisting !== '') {
            params.skipExisting = formRef.current.skipExisting
        }
        if (formRef.current.targetDirectory !== '') {
            params.targetDirectory = formRef.current.targetDirectory
        }
        if (formRef.current.targetId !== '') {
            params.targetId = formRef.current.targetId
        }
        if (formRef.current.targetKind !== '') {
            params.targetKind = formRef.current.targetKind
        }
        if (formRef.current.updateImages !== '') {
            params.updateImages = formRef.current.updateImages
        }
        if (formRef.current.updateMetadata !== '') {
            params.updateMetadata = formRef.current.updateMetadata
        }
        if (formRef.current.updateVideos !== '') {
            params.updateVideos = formRef.current.updateVideos
        }
        navPush(params)
        let details = {
            episodeOrder: formRef.current.episodeOrder,
            extractOnly: formRef.current.extractOnly,
            metadataId: formRef.current.metadataId,
            metadataSource: formRef.current.metadataSource,
            seasonOrder: formRef.current.seasonOrder,
            skipExisting: formRef.current.skipExisting,
            targetDirectory: formRef.current.targetDirectory,
            targetId: formRef.current.targetId,
            targetKind: formRef.current.targetKind,
            updateImages: formRef.current.updateImages,
            updateMetadata: formRef.current.updateMetadata,
            updateVideos: formRef.current.updateVideos,
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
                        navPush(routes.adminJobDetails, {
                            jobId: job.id
                        })
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
                focusStart
                focusKey="page-entry"
                focusDown="directory"
                itemsPerRow={4}
                items={buttons}
                renderItem={renderItem} />
            <C.SnowGrid focusKey="directory" focusDown="payload" itemsPerRow={1}>
                <C.SnowLabel>Target Directory</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetDirectory')} value={form.targetDirectory} />
            </C.SnowGrid>
            <C.SnowGrid focusKey="payload" itemsPerRow={6}>
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
