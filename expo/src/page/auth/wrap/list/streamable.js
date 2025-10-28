import { C, useAppContext } from 'snowstream'

export default function StreamableListPage() {
    const { navPush, navPop, currentRoute } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()
    const { SnowStyle } = C.useSnowContext()

    const [streamSource, setStreamSource] = C.React.useState(null)
    const [streamableItems, setStreamableItems] = C.React.useState(null)

    const styles = {
        tableColumn: {
            borderLeftWidth: 2,
            borderLeftColor: SnowStyle.color.core
        }
    }

    C.React.useEffect(() => {
        if (!streamSource && currentRoute?.routeParams?.streamSourceId) {
            apiClient.getStreamSource(currentRoute.routeParams.streamSourceId).then((response) => {
                setStreamSource(response)
            })
        }
        if (streamSource) {
            if (streamSource?.has_groups) {
                if (currentRoute?.routeParams?.group) {
                    setStreamableItems(streamSource.grouped_streamables[currentRoute?.routeParams?.group])
                } else {
                    setStreamableItems(null)
                }
            } else {
                setStreamableItems(streamSource.streamables)
            }
        }
    }, [streamSource, currentRoute])

    if (streamSource?.has_groups && !streamableItems) {
        const renderItem = (group, itemIndex) => {
            return (
                <C.SnowTextButton
                    tall
                    key={itemIndex}
                    title={group}
                    onPress={navPush({
                        params: {
                            group,
                            streamSourceId: currentRoute?.routeParams?.streamSourceId
                        },
                        replace: false
                    })}
                />
            )
        }
        return (
            <C.SnowGrid focusStart focusKey="page-entry" items={streamSource.groups} renderItem={renderItem} />
        )
    }

    if (streamSource && streamableItems) {
        let groupsButton = null
        let listFocusKey = 'page-entry'
        if (streamSource.has_groups) {
            listFocusKey = 'streamable-list'
            groupsButton = (
                <C.SnowGrid key="group-grid" itemsPerRow={3}>
                    <C.SnowTextButton focusKey="page-entry" focusDown="streamable-list" title="Groups" onPress={navPop} />
                </C.SnowGrid>
            )
        }

        if (streamSource.has_guide) {
            return (
                <>
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
                                <C.View key={streamable.id}>
                                    < C.SnowGrid key="streamable-grid" assignFocus="false" itemsPerRow={3} >
                                        <C.SnowTextButton
                                            {...focus}
                                            title={name}
                                            onPress={navPush({
                                                path: routes.streamablePlay,
                                                params: {
                                                    streamSourceId: streamSource.id,
                                                    streamableId: streamable.id,
                                                }
                                            })}
                                            onLongPress={navPush({
                                                path: routes.streamablePlay,
                                                params: {
                                                    streamSourceId: streamSource.id,
                                                    streamableId: streamable.id,
                                                    forcePlayer: 'exo'
                                                }
                                            })}
                                        />
                                        <C.SnowText style={styles.tableColumn}>{currentProgram}</C.SnowText>
                                        <C.SnowText style={styles.tableColumn}>{nextProgram}</C.SnowText>
                                    </C.SnowGrid >
                                    <C.SnowBreak />
                                </C.View>
                            )
                        })
                    }
                </>
            )
        } else {
            const renderItem = (streamable, itemIndex) => {
                let name = streamable.name_display ? streamable.name_display : streamable.name
                return (
                    <C.SnowTextButton
                        tall
                        key={streamable.id}
                        title={name}
                        onPress={navPush({
                            path: routes.streamablePlay,
                            params: {
                                streamSourceId: streamSource.id,
                                streamableId: streamable.id,
                            }
                        })}
                        onLongPress={navPush({
                            path: routes.streamablePlay,
                            params: {
                                streamSourceId: streamSource.id,
                                streamableId: streamable.id,
                                forcePlayer: 'exo'
                            }
                        })}
                    />
                )
            }
            return (
                <>
                    {groupsButton}
                    <C.SnowGrid key="streamable-grid-with-group" focusStart focusKey={listFocusKey} items={streamableItems} renderItem={renderItem} />
                </>
            )
        }
    }
    return <C.Text>Loading stream source {currentRoute.routeParams.streamSourceId}.</C.Text>
}
