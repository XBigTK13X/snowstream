import { C, useAppContext } from 'snowstream'

function ChannelEditRow(props) {
    const { apiClient } = useAppContext()
    const [form, setForm] = C.React.useState({
        id: props.channel.id,
        editedId: props.channel.edited_id ?? '',
        editedName: props.channel.edited_name ?? '',
        editedNumber: props.channel.edited_number ?? '',
        streamableId: null
    })
    const [showModal, setShowModal] = C.React.useState(false)
    const [filter, setFilter] = C.React.useState('')
    const changeForm = (key) => {
        return (val) => {
            if (key === 'kind') {
                setKindIndex(val)
                val = guideSourceKinds[val]
            }
            setForm((prev) => {
                let result = { ...prev }
                result[key] = val
                return result
            })
        }
    }
    const saveChannel = (payload) => {
        return apiClient.saveChannel(payload)
    }
    if (showModal) {
        return (
            <C.SnowModal focusLayer="channel-list" scroll onRequestClose={() => { setShowModal(false) }}>
                <C.SnowLabel>{props.channel.parsed_id}</C.SnowLabel>
                <C.SnowTextButton title="Cancel" onPress={() => { setShowModal(false) }} />
                <C.SnowGrid itemsPerRow={2}>
                    <C.SnowLabel>Filter</C.SnowLabel>
                    <C.SnowInput value={filter} onValueChange={setFilter} />
                </C.SnowGrid>
                <C.SnowGrid >
                    {props.streamables.map((streamable) => {
                        if (filter) {
                            let isFiltered = true
                            if (streamable.name_display && streamable.name_display.toLowerCase().includes(filter)) {
                                isFiltered = false
                            }
                            if (streamable.name.toLowerCase().includes(filter)) {
                                isFiltered = false
                            }
                            if (isFiltered) {
                                return true
                            }
                        }
                        return (
                            <C.SnowTextButton
                                title={streamable.name_display ? streamable.name_display : streamable.name}
                                onPress={() => {
                                    saveChannel({ ...form, streamableId: streamable.id })
                                        .then(() => {
                                            setShowModal(false)
                                        })
                                }} />
                        )
                    })}
                </C.SnowGrid>
            </C.SnowModal>
        )
    }

    let streamableName = "Streamable"
    if (props.channel.streamable) {
        streamableName = props.channel.streamable.name_display ? props.channel.streamable.name_display : props.channel.streamable.name
        streamableName = `[${streamableName}]`
    }

    return (
        <C.View>
            <C.SnowGrid itemsPerRow={3}>
                <C.SnowLabel>{props.channel.parsed_id}</C.SnowLabel>
                <C.SnowTextButton title="Save" onPress={() => { saveChannel(form) }} />
                <C.SnowTextButton title={streamableName} onPress={() => { setShowModal(true) }} />
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={3}>
                <C.SnowLabel>ID</C.SnowLabel>
                <C.SnowLabel>Name</C.SnowLabel>
                <C.SnowLabel>Number</C.SnowLabel>
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={3}>
                <C.SnowInput onValueChange={changeForm('editedId')} value={form.editedId} />
                <C.SnowInput onValueChange={changeForm('editedName')} value={form.editedName} />
                <C.SnowInput onValueChange={changeForm('editedNumber')} value={form.editedNumber} />
            </C.SnowGrid>
            <C.SnowBreak />
        </C.View>
    )
}

export default function ChannelEditPage() {
    const { apiClient, currentRoute } = useAppContext()
    const [guideSource, setGuideSource] = C.React.useState(null)
    const [streamables, setStreamables] = C.React.useState(null)
    const [query, setQuery] = C.React.useState('')
    const [filteredChannels, setFilteredChannels] = C.React.useState([])
    C.React.useEffect(() => {
        if (!guideSource) {
            apiClient.getChannelGuideSource(currentRoute.routeParams.guideSourceId).then((guideSource) => {
                setGuideSource(guideSource)
            }).then(() => {
                apiClient.getStreamableList().then((streamableList) => {
                    setStreamables(streamableList)
                })
            })
        }
    })

    if (!guideSource || !streamables) {
        return <C.SnowText>Loading channels...</C.SnowText>
    }

    let channelRows = null
    if (filteredChannels && filteredChannels.length) {
        channelRows = (<C.FillView>
            {filteredChannels.map((channel, channelIndex) => {
                return <ChannelEditRow streamables={streamables} channel={channel} key={channelIndex + "." + channel.parsed_id} />
            })}
        </C.FillView>)
    }

    return (
        <C.View>
            <C.SnowText>There are {guideSource.channels.length} channels.</C.SnowText>
            <C.SnowGrid itemsPerRow={3}>
                <C.SnowLabel>Filter (required)</C.SnowLabel>
                <C.SnowInput
                    onValueChange={setQuery}
                    value={query}
                    onDebounce={(val) => {
                        let results = guideSource.channels.filter((channel) => {
                            if (channel.parsed_name && channel.parsed_name.toLowerCase().includes(val)) {
                                return true
                            }
                            if (channel.parsed_id && ('' + channel.parsed_id).toLowerCase().includes(val)) {
                                return true
                            }
                            if (channel.parsed_number && ('' + channel.parsed_number).toLowerCase().includes(val)) {
                                return true
                            }
                            return false
                        })
                        if (results.length > 200) {
                            results = results.slice(0, 200)
                        }
                        setFilteredChannels(results)
                    }} />
                <C.SnowLabel>{filteredChannels.length} matching channels.</C.SnowLabel>
            </C.SnowGrid>
            <C.SnowBreak />
            {channelRows}
        </C.View >
    )
}
