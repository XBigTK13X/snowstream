import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

export default function StreamSourceEditPage() {
    const { navPush, currentRoute } = Snow.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [streamSourceName, setStreamSourceName] = C.React.useState('')
    const [streamSourceKind, setStreamSourceKind] = C.React.useState('HdHomeRun')
    const [streamSourceKindIndex, setStreamSourceKindIndex] = C.React.useState(0)
    const [streamSourceUrl, setStreamSourceUrl] = C.React.useState('')
    const [streamSourceUsername, setStreamSourceUsername] = C.React.useState('')
    const [streamSourcePassword, setStreamSourcePassword] = C.React.useState('')
    const [streamSourceId, setStreamSourceId] = C.React.useState(null)
    const [streamSourceDeleteCount, setStreamSourceDeleteCount] = C.React.useState(3)
    const [streamSourceDeleted, setStreamSourceDeleted] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!streamSourceId && currentRoute.routeParams.streamSourceId) {
            apiClient.getStreamSource(currentRoute.routeParams.streamSourceId).then((streamSource) => {
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
        'IptvM3u',
        'FrigateNvr',
        'TubeArchivist'
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
    if (streamSourceDeleted) {
        return <C.Redirect href={routes.adminStreamSourceList} />
    }

    return (
        <C.SnowGrid focusStart focusKey='page-entry' itemsPerRow={1}>
            {streamSourceId ? (
                <C.SnowTextButton
                    title="Streamables"
                    onPress={navPush(routes.adminStreamablesEdit, { streamSourceId: currentRoute.routeParams.streamSourceId }, true)} />
            ) : null}
            {streamSourceId ? <C.SnowTextButton title={`Delete (${streamSourceDeleteCount})`} onPress={deleteStreamSource} /> : null}

            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={setStreamSourceName} value={streamSourceName} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown
                options={streamSourceKinds}
                onValueChange={chooseStreamSourceKind}
                valueIndex={streamSourceKindIndex} />
            <C.SnowLabel>URL</C.SnowLabel>
            <C.SnowInput onValueChange={setStreamSourceUrl} value={streamSourceUrl} />

            <C.SnowLabel>Username</C.SnowLabel>
            <C.SnowInput onValueChange={setStreamSourceUsername} value={streamSourceUsername} />

            <C.SnowLabel>Password</C.SnowLabel>
            <C.SnowInput onValueChange={setStreamSourcePassword} value={streamSourcePassword} />

            <C.SnowTextButton title="Save Stream Source" onPress={saveStreamSource} />
        </C.SnowGrid >
    )
}
