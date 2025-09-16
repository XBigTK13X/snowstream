import C from '../../../../common'

function ChannelEditRow() {
    return null
}

export default function EpisodeGuideEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()

    const { channels, setChannels } = C.React.useState(null)
    const { streamSource, setStreamSource } = C.React.useState(null)

    const localParams = C.useLocalSearchParams()
    C.React.useEffect(() => {
        if (!channels) {
            apiClient.getStreamSource(localParams.streamSourceId).then((streamSource) => {
                setStreamSource(streamSource)
            })
        }
    })
    let streamSourceKinds = [
        'HdHomeRun',
        'IptvEpg',
        'IptvM3u',
        'FrigateNvr',
        'SchedulesDirect',
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

    return (
        <C.FillView>
            { }
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
            {deleteButton}
        </C.FillView >
    )
}
