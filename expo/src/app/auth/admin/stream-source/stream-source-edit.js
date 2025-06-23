import C from '../../../../common'

export default function StreamSourceEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const [streamSourceName, setStreamSourceName] = C.React.useState('')
    const [streamSourceKind, setStreamSourceKind] = C.React.useState('HdHomeRun')
    const [streamSourceKindIndex, setStreamSourceKindIndex] = C.React.useState(0)
    const [streamSourceUrl, setStreamSourceUrl] = C.React.useState('')
    const [streamSourceUsername, setStreamSourceUsername] = C.React.useState('')
    const [streamSourcePassword, setStreamSourcePassword] = C.React.useState('')
    const [streamSourceId, setStreamSourceId] = C.React.useState(null)
    const [streamSourceDeleteCount, setStreamSourceDeleteCount] = C.React.useState(3)
    const [streamSourceDeleted, setStreamSourceDeleted] = C.React.useState(false)
    const localParams = C.useLocalSearchParams()
    C.React.useEffect(() => {
        if (!streamSourceId && localParams.streamSourceId) {
            apiClient.getStreamSource(localParams.streamSourceId).then((streamSource) => {
                setStreamSourceName(streamSource.name || '')
                setStreamSourceKind(streamSource.kind || '')
                setStreamSourceUrl(streamSource.url || '')
                setStreamSourceUsername(streamSource.username || '')
                setStreamSourcePassword(streamSource.password || '')
                setStreamSourceId(streamSource.id)
            })
        }
    })
    let streamSourceKinds = [
        'HdHomeRun',
        'IptvEpg',
        'IptvM3u',
        'FrigateNvr',
        'SchedulesDirect',
    ]
    const chooseStreamSourceKind = (chosenKindIndex) => {
        setStreamSourceKind(streamSourceKinds[chosenKindIndex])
        setStreamSourceKindIndex(chosenKindIndex)
    }
    const saveStreamSource = () => {
        let payload = {
            id: streamSourceId,
            name: streamSourceName,
            kind: streamSourceKind,
            url: streamSourceUrl,
            username: streamSourceUsername,
            password: streamSourcePassword
        }
        apiClient.saveStreamSource(payload)
    }

    const deleteStreamSource = () => {
        if (streamSourceDeleteCount > 1) {
            setStreamSourceDeleteCount(streamSourceDeleteCount - 1)
        }
        else {
            apiClient.deleteStreamSource(streamSourceId).then((() => {
                setStreamSourceDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (streamSourceId) {
        deleteButton = <C.SnowTextButton title={`Delete Stream Source (${streamSourceDeleteCount})`} onPress={deleteStreamSource} />
    }
    if (streamSourceDeleted) {
        return <C.Redirect href={routes.admin.streamSourceList} />
    }

    return (
        <C.FillView scroll >
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onChangeText={setStreamSourceName} value={streamSourceName} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown
                options={streamSourceKinds}
                onChoose={chooseStreamSourceKind}
                value={streamSourceKind} />

            <C.SnowLabel>URL</C.SnowLabel>
            <C.SnowInput onChangeText={setStreamSourceUrl} value={streamSourceUrl} />

            <C.SnowLabel>Username</C.SnowLabel>
            <C.SnowInput onChangeText={setStreamSourceUsername} value={streamSourceUsername} />

            <C.SnowLabel>Password</C.SnowLabel>
            <C.SnowInput onChangeText={setStreamSourcePassword} value={streamSourcePassword} />

            <C.SnowTextButton title="Save Stream Source" onPress={saveStreamSource} />
            {deleteButton}
        </C.FillView >
    )
}
