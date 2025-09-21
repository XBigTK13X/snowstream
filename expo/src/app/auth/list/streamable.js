import C from '../../../common'

export default function StreamableListPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const { SnowStyle } = C.useStyleContext()
    const localParams = C.useLocalSearchParams()
    const [streamSource, setStreamSource] = C.React.useState(null)
    const [streamableGroups, setStreamableGroups] = C.React.useState(null)
    const [streamableItems, setStreamableItems] = C.React.useState(null)

    const styles = {
        tableColumn: {
            borderLeftWidth: 2,
            borderLeftColor: SnowStyle.color.core
        }
    }

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
        if (streamSource.has_guide) {
            return (
                <C.View>
                    <C.SnowGrid itemsPerRow={3}>
                        <C.SnowTextButton title="Groups" onPress={() => { setStreamableItems(null) }} />
                    </C.SnowGrid>
                    {
                        streamableItems.map((streamable, itemIndex) => {
                            let currentProgram = "No guide information"
                            let nextProgram = "No guide information"
                            if (streamable.current_program) {
                                const pp = streamable.current_program
                                currentProgram = `${pp.display_time} - ${pp.name}`
                            }
                            if (streamable.next_program) {
                                const pp = streamable.next_program
                                nextProgram = `${pp.display_time} - ${pp.name}`
                            }
                            return (
                                <C.View>
                                    <C.SnowGrid itemsPerRow={3}>
                                        <C.SnowTextButton title={streamable.name_display ? streamable.name_display : streamable.name} onPress={() => {
                                            routes.func(routes.streamablePlay, {
                                                streamSourceId: streamSource.id,
                                                streamableId: streamable.id,
                                            })
                                        }} />
                                        <C.SnowText style={styles.tableColumn}>{currentProgram}</C.SnowText>
                                        <C.SnowText style={styles.tableColumn}>{nextProgram}</C.SnowText>
                                    </C.SnowGrid>
                                    <C.SnowBreak />
                                </C.View>
                            )
                        })
                    }
                </C.View>
            )
        } else {
            const renderItem = (streamable, itemIndex) => {
                return (
                    <C.SnowTextButton
                        tall
                        shouldFocus={itemIndex === 0}
                        key={streamable.id}
                        title={streamable.name_display ? streamable.name_display : streamable.name}
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
                <C.View>
                    <C.SnowGrid itemsPerRow={3}>
                        <C.SnowTextButton title="Groups" onPress={() => { setStreamableItems(null) }} />
                    </C.SnowGrid>
                    <C.SnowGrid items={streamableItems} renderItem={renderItem} />
                </C.View>
            )
        }
    }
    return <C.Text>Loading stream source {localParams.streamSourceId}.</C.Text>
}
