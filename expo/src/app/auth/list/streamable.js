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
                    if (response.has_groups) {
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
        let groupsButton = null
        if (streamSource.has_groups) {
            groupsButton = (
                <C.SnowGrid itemsPerRow={3}>
                    <C.SnowTextButton title="Groups" onPress={() => { setStreamableItems(null) }} />
                </C.SnowGrid>
            )
        }
        if (streamSource.has_guide) {
            return (
                <C.View>
                    {groupsButton}
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
                            let name = streamable.name_display ? streamable.name_display : streamable.name
                            return (
                                <C.View key={itemIndex}>
                                    <C.SnowGrid itemsPerRow={3}>
                                        <C.SnowTextButton title={name}
                                            onPress={() => {
                                                routes.goto(routes.streamablePlay, {
                                                    streamSourceId: streamSource.id,
                                                    streamableId: streamable.id,
                                                })
                                            }}
                                        />
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
                let name = streamable.name_display ? streamable.name_display : streamable.name
                return (
                    <C.SnowTextButton
                        tall
                        key={streamable.id}
                        title={name}
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
                    {groupsButton}
                    <C.SnowGrid items={streamableItems} renderItem={renderItem} />
                </C.View>
            )
        }
    }
    return <C.Text>Loading stream source {localParams.streamSourceId}.</C.Text>
}
