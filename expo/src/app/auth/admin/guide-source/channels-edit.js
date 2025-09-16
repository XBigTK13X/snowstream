import C from '../../../../common'

function ChannelEditRow(props) {
    const { apiClient } = C.useAppContext()
    const [form, setForm] = C.React.useState({
        id: props.channel.id,
        editedId: props.channel.editedId,
        editedName: props.channel.editedName,
        editedNumber: props.channel.editedNumber,
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
    const saveChannel = () => {
        apiClient.saveChannel(form)
    }
    if (showModal) {
        return (
            <C.SnowModal onRequestClose={() => { setShowModal(false) }}>
                <C.SnowTextButton title="Cancel" onPress={() => { setShowModal(false) }} />
                <C.SnowGrid shrink itemsPerRow={2}>
                    <C.SnowLabel>Filter</C.SnowLabel>
                    <C.SnowInput value={filter} onValueChange={setFilter} />
                </C.SnowGrid>
                <C.SnowGrid>
                    {props.streamables.map((streamable) => {
                        if (filter) {
                            if (streamable.name_display && streamable.name_display.toLowerCase() === -1) {
                                return null
                            }
                            if (streamable.name.toLowerCase().indexOf(filter) === -1) {
                                return null
                            }
                        }
                        return (
                            <C.SnowTextButton
                                title={streamable.name_display ? streamable.name_display : streamable.name}
                                onPress={() => {
                                    changeForm('streamableId')(streamable.id)
                                    saveChannel()
                                    setShowModal(false)
                                }} />
                        )
                    })}
                </C.SnowGrid>
            </C.SnowModal>
        )
    }

    return (
        <C.View>
            <C.SnowGrid shrink itemsPerRow={3}>
                <C.SnowLabel>{props.channel.parsed_id}</C.SnowLabel>
                <C.SnowTextButton title="Save" onPress={saveChannel} />
                <C.SnowTextButton title="Streamable" onPress={() => { setShowModal(true) }} />
            </C.SnowGrid>
            <C.SnowGrid shrink itemsPerRow={3}>
                <C.SnowLabel>ID</C.SnowLabel>
                <C.SnowLabel>Name</C.SnowLabel>
                <C.SnowLabel>Number</C.SnowLabel>
            </C.SnowGrid>
            <C.SnowGrid shrink itemsPerRow={3}>
                <C.SnowInput onChangeValue={changeForm('editedId')} value={form.editedId} />
                <C.SnowInput onChangeValue={changeForm('editedName')} value={form.editedName} />
                <C.SnowInput onChangeValue={changeForm('editedNumber')} value={form.editedNumber} />
            </C.SnowGrid>
            <C.SnowBreak />
        </C.View>
    )
}

export default function ChannelEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const [guideSource, setGuideSource] = C.React.useState(null)
    const [streamables, setStreamables] = C.React.useState(null)
    const [query, setQuery] = C.React.useState('')
    const [filteredChannels, setFilteredChannels] = C.React.useState([])

    const localParams = C.useLocalSearchParams()
    C.React.useEffect(() => {
        if (!guideSource) {
            apiClient.getChannelGuideSource(localParams.guideSourceId).then((guideSource) => {
                setGuideSource(guideSource)
            }).then(() => {
                apiClient.getStreamableList().then((streamableList) => {
                    setStreamables(streamableList)
                })
            })
        }
    })

    if (!guideSource || !streamables) {
        return null
    }

    let channelRows = null
    if (filteredChannels && filteredChannels.length) {
        channelRows = (<C.FillView>
            {filteredChannels.map((channel, channelIndex) => {
                return <ChannelEditRow streamables={streamables} channel={channel} key={channelIndex} />
            })}
        </C.FillView>)
    }

    return (
        <C.FillView>
            <C.SnowText>There are {guideSource.channels.length} channels.</C.SnowText>
            <C.SnowGrid shrink itemsPerRow={3}>
                <C.SnowLabel>Filter (required)</C.SnowLabel>
                <C.SnowInput
                    onValueChange={setQuery}
                    value={query}
                    onDebounce={(val) => {
                        let results = guideSource.channels.filter((channel) => {
                            if (channel.parsed_name && channel.parsed_name.toLowerCase().indexOf(val) !== -1) {
                                return true
                            }
                            if (channel.parsed_id && channel.parsed_id.toLowerCase().indexOf(val) !== -1) {
                                return true
                            }
                            if (channel.parsed_number && channel.parsed_number.toLowerCase().indexOf(val) !== -1) {
                                return true
                            }
                            return false
                        })
                        setFilteredChannels(results)
                    }} />
                <C.SnowLabel>{filteredChannels.length} matching channels.</C.SnowLabel>
            </C.SnowGrid>
            <C.SnowBreak />
            {channelRows}
        </C.FillView >
    )
}
