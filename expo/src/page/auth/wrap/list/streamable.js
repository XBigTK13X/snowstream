import { C, useAppContext } from 'snowstream'

export default function StreamableListPage() {
    const { navPush, currentRoute } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()
    const { SnowStyle } = C.useSnowContext()

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
            apiClient.getStreamSource(currentRoute.routeParams.streamSourceId).then((response) => {
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
    }, [streamSource])


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
            <C.SnowGrid focusStart focusKey="page-entry" items={streamableGroups} renderItem={renderItem} />
        )
    }

    if (streamSource && streamableItems) {
        let groupsButton = null
        let listFocusKey = 'page-entry'
        if (streamSource.has_groups) {
            listFocusKey = 'streamable-list'
            groupsButton = (
                <C.SnowGrid itemsPerRow={3}>
                    <C.SnowTextButton focusKey="page-entry" focusDown="streamable-list" title="Groups" onPress={() => { setStreamableItems(null) }} />
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
                            let focus = {}
                            if (itemIndex === 0) {
                                focus.focusStart = true
                                focus.focusKey = listFocusKey
                            }
                            else {
                                focus.focusKey = `${listFocusKey}-${itemIndex}`
                            }
                            if (itemIndex !== streamableItems.length - 1) {
                                focus.focusDown = `${listFocusKey}-${itemIndex + 1}`
                            }
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
                                    <C.SnowGrid assignFocus="false" itemsPerRow={3}>
                                        <C.SnowTextButton
                                            {...focus}
                                            title={name}
                                            onPress={navPush(routes.streamablePlay, {
                                                streamSourceId: streamSource.id,
                                                streamableId: streamable.id,
                                            }, true)}
                                            onLongPress={navPush(routes.streamablePlay, {
                                                streamSourceId: streamSource.id,
                                                streamableId: streamable.id,
                                                forcePlayer: 'exo'
                                            }, true)}
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
                        onPress={navPush(routes.streamablePlay, {
                            streamSourceId: streamSource.id,
                            streamableId: streamable.id,
                        }, true)}
                        onLongPress={navPush(routes.streamablePlay, {
                            streamSourceId: streamSource.id,
                            streamableId: streamable.id,
                            forcePlayer: 'exo'
                        }, true)}
                    />
                )
            }
            return (
                <C.View>
                    {groupsButton}
                    <C.SnowGrid focusStart focusKey={listFocusKey} items={streamableItems} renderItem={renderItem} />
                </C.View>
            )
        }
    }
    return <C.Text>Loading stream source {currentRoute.routeParams.streamSourceId}.</C.Text>
}
