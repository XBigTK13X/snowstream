import { C, useAppContext } from 'snowstream'



function StreamableWithGuideButton(props) {
    let currentProgram = "No guide information"
    let nextProgram = "No guide information"
    if (props.streamable.current_program) {
        const pp = props.streamable.current_program
        currentProgram = `${pp.display_time} - ${pp.name}`
    }
    if (props.streamable.next_program) {
        const pp = props.streamable.next_program
        nextProgram = `${pp.display_time} - ${pp.name}`
    }
    let name = props.streamable.name_display ? props.streamable.name_display : props.streamable.name
    return (
        <C.SnowView key={props.streamable.id}>
            < C.SnowGrid key="streamable-grid" assignFocus="false" itemsPerRow={3} >
                <C.SnowTextButton
                    title={name}
                    onPress={props.navPush({
                        path: props.routes.streamablePlay,
                        params: {
                            streamSourceId: props.streamSource.id,
                            streamableId: props.streamable.id,
                        }
                    })}
                    onLongPress={props.navPush({
                        path: props.routes.streamablePlay,
                        params: {
                            streamSourceId: props.streamSource.id,
                            streamableId: props.streamable.id,
                            forcePlayer: 'exo'
                        }
                    })}
                />
                <C.SnowText style={props.styles.tableColumn}>{currentProgram}</C.SnowText>
                <C.SnowText style={props.styles.tableColumn}>{nextProgram}</C.SnowText>
            </C.SnowGrid >
            <C.SnowBreak />
        </C.SnowView>
    )
}

function StreamableButton(props) {
    let name = props.streamable.name_display ? props.streamable.name_display : props.streamable.name
    return (
        <C.SnowTextButton
            tall
            key={props.streamable.id}
            title={name}
            onPress={props.navPush({
                path: props.routes.streamablePlay,
                params: {
                    streamSourceId: props.streamSource.id,
                    streamableId: props.streamable.id,
                }
            })}
            onLongPress={props.navPush({
                path: props.routes.streamablePlay,
                params: {
                    streamSourceId: props.streamSource.id,
                    streamableId: props.streamable.id,
                    forcePlayer: 'exo'
                }
            })}
        />
    )
}

export default function StreamableListPage() {
    const { navPush, currentRoute } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()
    const { SnowStyle } = C.useSnowContext()

    const styles = {
        tableColumn: {
            borderLeftWidth: 2,
            borderLeftColor: SnowStyle.color.core
        }
    }

    const [streamSource, setStreamSource] = C.React.useState(null)
    const [groupList, setGroupList] = C.React.useState(null)
    const [streamableList, setStreamableList] = C.React.useState(null)

    C.React.useEffect(() => {
        apiClient.getStreamSource(currentRoute.routeParams.streamSourceId)
            .then((response) => {
                setStreamSource(response)
            })
    }, [])

    C.React.useEffect(() => {
        if (streamSource) {
            if (streamSource?.has_groups) {
                setGroupList(streamSource.groups)
                if (currentRoute?.routeParams?.group) {
                    setStreamableList(streamSource.grouped_streamables[currentRoute?.routeParams?.group])
                }
            }
            else {
                setStreamableList(streamSource.streamables)
            }
        }
    }, [currentRoute, streamSource])

    if (!streamSource) {
        return <C.Text>Loading stream source {currentRoute.routeParams.streamSourceId}.</C.Text>
    }

    if (groupList && !streamableList) {
        const renderItem = (item) => {
            return <C.SnowTextButton title={item} onPress={
                navPush({
                    params: {
                        streamSourceId: streamSource.id,
                        group: item
                    },
                    replace: false
                })
            } />
        }
        return (
            <C.SnowGrid items={groupList} renderItem={renderItem} />
        )
    }

    let itemList = null
    if (streamSource.has_guide) {
        const renderItem = (item) => {
            return (
                <StreamableWithGuideButton
                    styles={styles}
                    routes={routes}
                    navPush={navPush}
                    streamable={item}
                    streamSource={streamSource}
                />
            )
        }
        itemList = (
            <C.SnowGrid itemsPerRow={1} items={streamableList} renderItem={renderItem} />
        )
    }
    else {
        let focusProps = {}
        if (!streamSource.has_groups) {
            focusProps.focusStart = true
            focusProps.focusKey = 'page-entry'
        }
        const renderItem = (item) => {
            return (
                <StreamableButton
                    routes={routes}
                    navPush={navPush}
                    streamable={item}
                    streamSource={streamSource}
                />
            )
        }
        itemList = (
            <C.SnowGrid
                {...focusProps}
                key="streamable-grid-with-group"
                items={streamableList}
                renderItem={renderItem} />
        )
    }
    return itemList
}
