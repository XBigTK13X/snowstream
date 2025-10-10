import { C, useAppContext } from 'snowstream'

function StreamableEditRow(props) {
    const { apiClient } = useAppContext()
    const [form, setForm] = C.React.useState({
        id: props.streamable.id,
        nameDisplay: props.streamable.name_display ?? '',
        groupDisplay: props.streamable.group_display ?? ''
    })
    const changeForm = (key) => {
        return (val) => {
            setForm((prev) => {
                let result = { ...prev }
                result[key] = val
                return result
            })
        }
    }
    const saveStreamable = (payload) => {
        return apiClient.saveStreamable(payload)
    }

    return (
        <C.View>
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowLabel>{props.streamable.name}</C.SnowLabel>
                <C.SnowTextButton title="Save" onPress={() => { saveStreamable(form) }} />
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={3}>
                <C.SnowLabel>Name</C.SnowLabel>
                <C.SnowLabel>Group</C.SnowLabel>
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={3}>
                <C.SnowInput onValueChange={changeForm('nameDisplay')} value={form.nameDisplay} />
                <C.SnowInput onValueChange={changeForm('groupDisplay')} value={form.groupDisplay} />
            </C.SnowGrid>
            <C.SnowBreak />
        </C.View>
    )
}

export default function StreamblesEditPage() {
    const { apiClient, currentRoute } = useAppContext()
    const [streamSource, setStreamSource] = C.React.useState(null)
    const [query, setQuery] = C.React.useState('')
    const [filteredStreams, setFilteredStreams] = C.React.useState([])

    C.React.useEffect(() => {
        if (!streamSource) {
            apiClient.getStreamSource(currentRoute.routeParams.streamSourceId).then((streamSource) => {
                setStreamSource(streamSource)
            })
        }
    })

    if (!streamSource) {
        return <C.SnowText>Loading streamables...</C.SnowText>
    }

    let streamRows = null
    if (filteredStreams && filteredStreams.length) {
        streamRows = (<C.FillView>
            {filteredStreams.map((streamable, itemIndex) => {
                return <StreamableEditRow streamable={streamable} key={itemIndex + "." + streamable.id} />
            })}
        </C.FillView>)
    }

    return (
        <C.View>
            <C.SnowText>There are {streamSource.streamables.length} streamables.</C.SnowText>
            <C.SnowGrid focusStart focusKey="page-entry" itemsPerRow={3}>
                <C.SnowLabel>Filter (required)</C.SnowLabel>
                <C.SnowInput
                    onValueChange={setQuery}
                    value={query}
                    onDebounce={(val) => {
                        let results = streamSource.streamables.filter((streamable) => {
                            if (streamable.name.toLowerCase().includes(val)) {
                                return true
                            }
                            if (streamable.name_display && streamable.name_display.toLowerCase().includes(val)) {
                                return true
                            }
                            return false
                        })
                        if (results.length > 200) {
                            results = results.slice(0, 200)
                        }
                        setFilteredStreams(results)
                    }} />
                <C.SnowLabel>{filteredStreams.length} matching streamables.</C.SnowLabel>
            </C.SnowGrid>
            <C.SnowBreak />
            {streamRows}
        </C.View >
    )
}
