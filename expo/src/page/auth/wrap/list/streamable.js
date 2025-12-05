import { C, useAppContext } from 'snowstream'

export default function StreamableListPage() {
    const { navPush, navPop, currentRoute } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()
    const { SnowStyle } = C.useSnowContext()

    const [streamSource, setStreamSource] = C.React.useState(null)

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
    }, [streamSource, currentRoute])

    if (!streamSource) {
        return <C.Text>Loading stream source {currentRoute.routeParams.streamSourceId}.</C.Text>
    }
    let listFocusKey = 'page-entry'

    let itemList = null
    if (streamSource.has_guide) {
        const renderItem = (streamable, itemIndex) => {
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
                <C.SnowView key={streamable.id}>
                    < C.SnowGrid key="streamable-grid" assignFocus="false" itemsPerRow={3} >
                        <C.SnowTextButton
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
                </C.SnowView>
            )
        }
        itemList = (
            streamSource.groups.map((group) => {
                return (
                    <C.SnowGrid itemsPerRow={1}>
                        {streamSource.grouped_streamables[group].map(renderItem)}
                    </C.SnowGrid>
                )
            })
        )
    }
    else {
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
        let focusProps = {}
        if (!streamSource.has_groups) {
            focusProps.focusStart = true
            focusProps.focusKey = 'page-entry'
        }
        itemList = (
            <C.SnowGrid
                {...focusProps}
                key="streamable-grid-with-group"
                items={streamSource.streamables}
                renderItem={renderItem} />
        )
    }
    if (streamSource.has_groups) {
        return (
            <C.SnowTabs
                focusStart
                focusKey="page-entry"
                headers={streamSource.groups}>
                {itemList}
            </C.SnowTabs>
        )
    }
    return itemList
}
