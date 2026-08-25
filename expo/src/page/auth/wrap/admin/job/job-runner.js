import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

const parseBoolParam = (paramValue, defaultValue) => {
    if (paramValue === 'true' || paramValue === true) {
        return true
    }
    if (paramValue === 'false' || paramValue === false) {
        return false
    }
    return defaultValue
}

export default function ShelfEditPage() {
    const { navPush, currentRoute } = Snow.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [form, setForm] = C.React.useState({
        episodeOrder: currentRoute.routeParams.episodeOrder ?? '',
        extractOnly: parseBoolParam(currentRoute.routeParams.extractOnly, false),
        metadataId: currentRoute.routeParams.metadataId ?? '',
        metadataSource: currentRoute.routeParams.metadataSource ?? '',
        seasonOrder: currentRoute.routeParams.seasonOrder ?? '',
        skipExisting: parseBoolParam(currentRoute.routeParams.skipExisting, true),
        targetDirectory: currentRoute.routeParams.targetDirectory ?? '',
        targetId: currentRoute.routeParams.targetId ?? '',
        targetKind: currentRoute.routeParams.targetKind ?? '',
        updateImages: parseBoolParam(currentRoute.routeParams.updateImages, true),
        updateMetadata: parseBoolParam(currentRoute.routeParams.updateMetadata, true),
        updateVideos: parseBoolParam(currentRoute.routeParams.updateVideos, false),
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
        navPush({ params, func: false })
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
        { name: 'Apply Directory Tag', apiCall: apiClient.createJobApplyDirectoryTag },
        { name: 'Clean File Records', apiCall: apiClient.createJobCleanFileRecords },
        { name: 'Close Transcode Sessions', apiCall: apiClient.closeAllTranscodeSessions },
        { name: 'Delete Cached Text', apiCall: apiClient.deleteAllCachedText },
        { name: 'Delete Media Records', apiCall: apiClient.createJobDeleteMediaRecords },
        { name: 'Identify Unknown Media', apiCall: apiClient.createJobIdentifyUnknownMedia },
        { name: 'Read Media Files', apiCall: apiClient.createJobReadMediaFiles },
        { name: 'Refresh Guide', apiCall: apiClient.createJobChannelGuideRefresh },
        { name: 'Refresh Streamables', apiCall: apiClient.createJobStreamSourcesRefresh },
        { name: 'Regen Screencaps', apiCall: apiClient.createJobRegenScreencapThumbnails },
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
                        navPush({
                            path: routes.adminJobDetails,
                            params: {
                                jobId: job.id
                            },
                            func: false
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
        <>
            <C.SnowGrid
                focusStart
                focusKey="page-entry"
                itemsPerRow={4}
                items={buttons}
                renderItem={renderItem} />
            <C.SnowGrid focusKey="payload" itemsPerRow={2}>
                <C.SnowLabel style={{ width: 250 }}>Target Directory</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetDirectory')} value={form.targetDirectory} />
                <C.SnowLabel style={{ width: 250 }}>Target Kind</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetKind')} value={form.targetKind} />
                <C.SnowLabel style={{ width: 250 }}>Target Id</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('targetId')} value={form.targetId} />
                <C.SnowLabel style={{ width: 250 }}>Metadata Id</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('metadataId')} value={form.metadataId} />
                <C.SnowLabel style={{ width: 250 }}>Metadata Source</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('metadataSource')} value={form.metadataSource} />
                <C.SnowLabel style={{ width: 250 }}>Season Order</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('seasonOrder')} value={form.seasonOrder} />
                <C.SnowLabel style={{ width: 250 }}>Episode Order</C.SnowLabel>
                <C.SnowInput onValueChange={changeForm('episodeOrder')} value={form.episodeOrder} />
            </C.SnowGrid>
            <C.SnowGrid focusKey="underload" itemsPerRow={1}>
                <C.SnowToggle title="Update Images" onValueChange={changeForm('updateImages')} value={form.updateImages} />
                <C.SnowToggle title="Update Metadata" onValueChange={changeForm('updateMetadata')} value={form.updateMetadata} />
                <C.SnowToggle title="Update Videos" onValueChange={changeForm('updateVideos')} value={form.updateVideos} />
                <C.SnowToggle title="Skip Existing" onValueChange={changeForm('skipExisting')} value={form.skipExisting} />
                <C.SnowToggle title="Extract Only" onValueChange={changeForm('extractOnly')} value={form.extractOnly} />
            </C.SnowGrid>
        </>
    )
}