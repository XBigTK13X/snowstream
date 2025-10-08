import { C, useAppContext } from 'snowstream'

export function WatchableListPage(props) {
    const { isAdmin, apiClient, routes, setMessageDisplay, navPush } = useAppContext()
    const localParams = C.useLocalSearchParams()

    const [shelf, setShelf] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)

    const shelfId = localParams.shelfId
    const [showPlaylisted, setShowPlaylisted] = C.React.useState(
        localParams.showPlaylisted ? localParams.showPlaylisted === 'true' : false
    )
    const [togglePlaylistedEnabled, setTogglePlaylistedEnabled] = C.React.useState(true)

    C.useFocusLayer('watchable-list')

    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
            props.loadItems(apiClient, shelfId, showPlaylisted)
                .then((response) => {
                    setItems(response)
                    if (response.length == 0) {
                        if (!showPlaylisted) {
                            setTogglePlaylistedEnabled(false)
                            setShowPlaylisted(true)
                            props.loadItems(apiClient, shelfId, true)
                                .then((response) => {
                                    setItems(response)
                                })
                        }
                        else {
                            setMessageDisplay(`Found no items to display.`)
                        }
                    }
                    if (response.length == 1) {
                        setMessageDisplay(`Found ${response.length} item to display.`)
                    }
                    if (response.length > 1) {
                        setMessageDisplay(`Found ${response.length} items to display.`)
                    }
                })
        }
    }, [shelf])

    if (shelf && items !== null) {
        let pageTitle = `Found ${items.length} items from shelf ${shelf.name}.`
        if (props.getPageTitle) {
            pageTitle = props.getPageTitle(shelf, items)
        }

        const watchAll = () => {
            props.watchAll(apiClient, shelfId).then(response => {
                navPush(routes.playingQueuePlay, {
                    playingQueueSource: response.source
                })
            })
        }

        const shuffleAll = () => {
            props.shuffleAll(apiClient, shelfId).then(response => {
                navPush(routes.playingQueuePlay, {
                    playingQueueSource: response.source
                })
            })
        }

        let Grid = C.SnowPosterGrid
        if (props.gridKind == 'screencap') {
            Grid = C.SnowScreencapGrid
        }

        let remoteId = null
        if (props.getRemoteId && items) {
            remoteId = props.getRemoteId(items[0])
        }

        let itemsPerRow = 4

        let buttons = []
        if (togglePlaylistedEnabled && props.toggleShowPlaylisted) {
            buttons.push((
                <C.SnowTextButton
                    title={showPlaylisted == true ? 'Hide Playlisted' : 'Show Playlisted'}
                    onPress={() => { props.toggleShowPlaylisted(routes, shelfId, showPlaylisted === true ? false : true) }}
                />
            ))
        }
        if (props.watchAll) {
            buttons.push(<C.SnowTextButton title="Watch All" onPress={watchAll} />)
        }
        if (props.shuffleAll) {
            buttons.push(<C.SnowTextButton title="Shuffle All" onPress={shuffleAll} />)
        }
        if (isAdmin) {
            buttons.push((
                <C.SnowTextButton title={`Scan ${props.kind}`} onPress={() => {
                    props.scanContentsJob(apiClient, shelfId)
                }} />
            ))
            if (props.updateMediaJob) {
                buttons.push((
                    <C.SnowUpdateMediaButton
                        kind={props.kind}
                        remoteId={remoteId}
                        updateMediaJob={(details) => {
                            details.shelfId = shelfId
                            return props.updateMediaJob(apiClient, details)
                        }}
                    />
                ))
            }
        }
        return (
            <C.View>
                <C.View>
                    <C.SnowText>{pageTitle}</C.SnowText>
                    <C.SnowGrid focusKey="page-entry" focusDown="watchable-items" itemsPerRow={itemsPerRow}>
                        {buttons}
                    </C.SnowGrid>
                </C.View>
                <Grid focusStart focusKey="watchable-items" items={items} />
            </C.View>
        )
    }
    return <C.SnowText>Loading items from shelf {localParams.shelfId}.</C.SnowText>
}

export default WatchableListPage
