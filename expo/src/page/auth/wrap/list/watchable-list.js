import { C, useAppContext } from 'snowstream'

export function WatchableListPage(props) {
    const { navPush, currentRoute, emitHubEvent } = C.useSnowContext()
    const { isAdmin, apiClient, routes } = useAppContext()

    const [shelf, setShelf] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)

    const shelfId = currentRoute.routeParams.shelfId
    let loadingName = currentRoute.routeParams?.shelfName ?? shelfId
    if (currentRoute.routeParams?.showName) {
        loadingName = currentRoute.routeParams?.showName
        if (currentRoute.routeParams?.seasonOrder) {
            loadingName += ` - Season ${currentRoute.routeParams?.seasonOrder}`
        }
    }
    const [showPlaylisted, setShowPlaylisted] = C.React.useState(
        currentRoute.routeParams.showPlaylisted ? currentRoute.routeParams.showPlaylisted === 'true' : false
    )
    const [togglePlaylistedEnabled, setTogglePlaylistedEnabled] = C.React.useState(true)

    C.React.useEffect(() => {
        if (!shelf && currentRoute?.routeParams) {
            apiClient.getShelf(currentRoute.routeParams.shelfId).then((response) => {
                setShelf(response)
            })
            props.loadItems(apiClient, shelfId, showPlaylisted)
                .then((response) => {
                    setItems(response)
                    if (response.length === 0) {
                        if (!showPlaylisted) {
                            setTogglePlaylistedEnabled(false)
                            setShowPlaylisted(true)
                            props.loadItems(apiClient, shelfId, true)
                                .then((innerResponse) => {
                                    setItems(innerResponse)
                                })
                        }
                    }
                })
        }
    }, [shelf, currentRoute])

    if (shelf && items?.length) {
        let pageTitle = `Found ${items.length} items from shelf ${shelf.name}.`
        if (props.getPageTitle) {
            pageTitle = props.getPageTitle(shelf, items)
        }

        const watchAll = () => {
            emitHubEvent('player.reset')
            props.watchAll(apiClient, shelfId).then((response) => {
                navPush({
                    path: routes.playingQueuePlay,
                    params: {
                        playingQueueSource: response.queue.source
                    },
                    func: false
                })
            })
        }

        const shuffleAll = () => {
            emitHubEvent('player.reset')
            props.shuffleAll(apiClient, shelfId).then((response) => {
                navPush({
                    path: routes.playingQueuePlay,
                    params: {
                        playingQueueSource: response.queue.source
                    },
                    func: false
                })
            })
        }

        let Grid = C.SnowPosterGrid
        if (props.gridKind === 'screencap') {
            Grid = C.SnowScreencapGrid
        }

        let remoteId = null
        if (props.getRemoteId && items) {
            remoteId = props.getRemoteId(items[0])
        }

        const buttons = []
        if (togglePlaylistedEnabled && props.toggleShowPlaylisted) {
            buttons.push((
                <C.SnowTextButton
                    key="toggle-playlisted"
                    title={showPlaylisted === true ? 'Hide Playlisted' : 'Show Playlisted'}
                    onPress={() => { props.toggleShowPlaylisted(routes, navPush, shelfId, showPlaylisted === true ? false : true) }}
                />
            ))
        }
        if (props.watchAll) {
            buttons.push(<C.SnowTextButton key="watch-all" title="Watch All" onPress={watchAll} />)
        }
        if (props.shuffleAll) {
            buttons.push(<C.SnowTextButton key="shuffle-all" title="Shuffle All" onPress={shuffleAll} />)
        }
        if (isAdmin) {
            buttons.push((
                <C.SnowCreateJobButton
                    key="create-job"
                    title="Create Job"
                    jobDetails={{
                        metadataId: remoteId,
                        ...props.getJobTarget(shelfId)
                    }} />
            ))
        }

        return (
            <C.SnowView>
                <C.SnowText center>{pageTitle}</C.SnowText>
                <C.SnowGrid focusKey="admin-buttons">
                    {buttons}
                </C.SnowGrid>
                <Grid focusStart focusKey="watchable-items" overlayTitle={props.overlayTitle} items={items} />
            </C.SnowView>
        )
    }

    return <C.SnowLabel center>Loading {loadingName}.</C.SnowLabel>
}

export default WatchableListPage