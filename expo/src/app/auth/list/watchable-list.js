import C from '../../../common'

export function WatchableListPage(props) {
    const { isAdmin, apiClient, routes, setMessageDisplay } = C.useAppContext()
    const localParams = C.useLocalSearchParams()

    const [shelf, setShelf] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)

    const shelfId = localParams.shelfId
    const [showPlaylisted, setShowPlaylisted] = C.React.useState(
        localParams.showPlaylisted ? localParams.showPlaylisted === 'true' : false
    )
    const [togglePlaylistedEnabled, setTogglePlaylistedEnabled] = C.React.useState(true)

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
    })
    if (shelf && items !== null) {
        let pageTitle = `Found ${items.length} items from shelf ${shelf.name}.`
        if (props.getPageTitle) {
            pageTitle = props.getPageTitle(shelf, items)
        }

        const gotoItem = (item) => {
            routes.gotoItem(item)
        }

        const toggleWatchedItem = (item) => {
            return props.toggleItemWatched(apiClient, item.id)
                .then((watched) => {
                    return props.loadItems(apiClient, shelfId, showPlaylisted)
                })
                .then((response) => {
                    setItems(response)
                })
        }

        const watchAll = () => {
            props.watchAll(apiClient, shelfId).then(response => {
                routes.goto(routes.playMedia, { playingQueueSource: response.source })
            })
        }

        const shuffleAll = () => {
            props.shuffleAll(apiClient, shelfId).then(response => {
                routes.goto(routes.playMedia, { playingQueueSource: response.source })
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

        let itemsPerRow = 1
        if (props.watchAll && props.shuffleAll) {
            itemsPerRow = 3
        }
        else if (!props.watchAll && !props.shuffleAll) {
            itemsPerRow = 1
        }
        else {
            itemsPerRow = 2
        }
        if (isAdmin) {
            itemsPerRow = 3
        }

        console.log({ showPlaylisted })

        return (
            <C.View>
                <C.SnowText>{pageTitle}</C.SnowText>
                <C.SnowGrid itemsPerRow={itemsPerRow}>
                    {(togglePlaylistedEnabled && props.toggleShowPlaylisted) ?
                        <C.SnowTextButton
                            title={showPlaylisted == true ? 'Hide Playlisted' : 'Show Playlisted'}
                            onPress={() => { props.toggleShowPlaylisted(routes, shelfId, showPlaylisted === true ? false : true) }}
                        /> : null
                    }
                    {props.watchAll ? <C.SnowTextButton title="Watch All" onPress={watchAll} /> : null}
                    {props.shuffleAll ? <C.SnowTextButton title="Shuffle All" onPress={shuffleAll} /> : null}
                    <C.SnowAdminButton title={`Scan ${props.kind}`} onPress={() => {
                        props.scanContentsJob(apiClient, shelfId)
                    }} />
                    {props.updateMediaJob ?
                        <C.SnowUpdateMediaButton
                            kind={props.kind}
                            remoteId={remoteId}
                            updateMediaJob={(details) => {
                                details.shelfId = shelfId
                                return props.updateMediaJob(apiClient, details)
                            }}
                        /> : null}
                </C.SnowGrid>
                <Grid shouldFocus onPress={gotoItem} onLongPress={toggleWatchedItem} items={items} />
            </C.View >
        )
    }
    return <C.SnowText>Loading items from shelf {localParams.shelfId}.</C.SnowText>
}

export default WatchableListPage
