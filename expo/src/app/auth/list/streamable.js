import C from '../../../common'

export default function StreamableListPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const localParams = C.useLocalSearchParams()
    const [streamSource, setStreamSource] = C.React.useState(null)
    const [streamableGroups, setStreamableGroups] = C.React.useState(null)
    const [streamableItems, setStreamableItems] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!streamSource) {
            apiClient.getStreamSource(localParams.streamSourceId).then((response) => {
                if (response) {
                    if (response.groups && response.groups.length > 0) {
                        setStreamableGroups(response.groups)
                    }
                    else {
                        setStreamableItems(response.streamables)
                    }
                }
                setStreamSource(response)
            })
        }
    })


    if (streamSource && streamableGroups && !streamableItems) {
        const chooseGroup = (group) => {
            setStreamableItems(streamSource.grouped_streamables[group])
        }
        const renderItem = (group, itemIndex) => {
            return (
                <C.SnowTextButton
                    tall
                    shouldFocus={itemIndex === 0}
                    key={itemIndex}
                    title={group}
                    onPress={() => { chooseGroup(group) }}
                />
            )
        }
        return (
            <C.SnowGrid items={streamableGroups} renderItem={renderItem} />
        )
    }

    if (streamSource && streamableItems) {
        const renderItem = (streamable, itemIndex) => {
            return (
                <C.SnowTextButton
                    tall
                    shouldFocus={itemIndex === 0}
                    key={streamable.id}
                    title={streamable.name}
                    onPress={routes.func(routes.streamablePlay, {
                        streamSourceId: streamSource.id,
                        streamableId: streamable.id,
                    })}
                    onLongPress={routes.func(routes.streamablePlay, {
                        streamSourceId: streamSource.id,
                        streamableId: streamable.id,
                        forcePlayer: 'exo'
                    })}
                />
            )
        }
        return (
            <C.FillView>
                <C.SnowGrid shrink itemsPerRow={3}>
                    <C.SnowTextButton title="Groups" onPress={() => { setStreamableItems(null) }} />
                </C.SnowGrid>
                <C.SnowGrid items={streamableItems} renderItem={renderItem} />
            </C.FillView>
        )
    }
    return <C.Text>Loading stream source {localParams.streamSourceId}.</C.Text>
}
