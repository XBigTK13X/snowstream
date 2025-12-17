import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

export default function StreamSourceEditPage() {
    const { navPush, currentRoute } = Snow.useSnowContext()
    const { apiClient, routes } = useAppContext()
    const { streamSourceId } = currentRoute?.routeParams
    const [form, setForm] = C.React.useState({
        id: null,
        name: '',
        kind: '',
        url: '',
        username: '',
        password: ''
    })
    const formRef = C.React.useRef(form)
    const [deleteCount, setDeleteCount] = C.React.useState(3)
    const deleteRef = C.React.useRef(deleteCount)


    C.React.useEffect(() => {
        formRef.current = form
    }, [form])

    C.React.useEffect(() => {
        deleteRef.current = deleteCount
    }, [deleteCount])

    C.React.useEffect(() => {
        if (streamSourceId) {
            apiClient.getStreamSource(streamSourceId).then((streamSource) => {
                setForm({
                    id: streamSource.id,
                    name: streamSource.name,
                    kind: streamSource.kind,
                    url: streamSource.url,
                    username: streamSource.username,
                    password: streamSource.password,
                })
            })
        }
    }, [streamSourceId])

    const saveStreamSource = () => {
        apiClient.saveStreamSource(formRef?.current)
    }

    const deleteStreamSource = () => {
        if (deleteRef.current > 1) {
            setDeleteCount(prev => { return prev - 1 })
        }
        else {
            apiClient.deleteStreamSource(streamSourceId).then((() => {
                navPush({
                    path: routes.adminStreamSourceList,
                    func: false
                })
            }))
        }
    }

    const streamSourceKinds = [
        'HdHomeRun',
        'IptvM3u',
        'FrigateNvr',
        'TubeArchivist'
    ]

    return (
        <C.SnowGrid focusStart focusKey='page-entry' itemsPerRow={1}>
            {streamSourceId ? (
                <C.SnowTextButton
                    title="Streamables"
                    onPress={navPush({
                        path: routes.adminStreamablesEdit,
                        params: { streamSourceId: currentRoute.routeParams.streamSourceId }
                    })} />
            ) : null}
            {streamSourceId ? <C.SnowTextButton title={`Delete (${deleteCount})`} onPress={deleteStreamSource} /> : null}

            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setForm(prev => {
                    return { ...prev, name: val }
                })
            }} value={form.name} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown
                options={streamSourceKinds}
                onValueChange={(val) => {
                    setForm(prev => {
                        return { ...prev, kind: streamSourceKinds[val] }
                    })
                }}
                valueIndex={streamSourceKinds.indexOf(form.kind)} />

            <C.SnowLabel>URL</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setForm(prev => {
                    return { ...prev, url: val }
                })
            }} value={form.url} />

            <C.SnowLabel>Username</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setForm(prev => {
                    return { ...prev, username: val }
                })
            }} value={form.username} />

            <C.SnowLabel>Password</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setForm(prev => {
                    return { ...prev, password: val }
                })
            }} value={form.password} />

            <C.SnowTextButton title="Save Stream Source" onPress={saveStreamSource} />
        </C.SnowGrid >
    )
}
