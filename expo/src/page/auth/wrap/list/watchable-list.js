import { C, useAppContext } from 'snowstream'
import Player from 'snowstream-player'

export function WatchableListPage(props) {
    const { navPush, currentRoute } = C.useSnowContext()
    const { isAdmin, apiClient, routes, } = useAppContext()

    const [shelf, setShelf] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)

    const shelfId = currentRoute.routeParams.shelfId
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
                    if (response.length == 0) {
                        if (!showPlaylisted) {
                            setTogglePlaylistedEnabled(false)
                            setShowPlaylisted(true)
                            props.loadItems(apiClient, shelfId, true)
                                .then((response) => {
                                    setItems(response)
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
            Player.action.reset()
                .then(() => {
                    return props.watchAll(apiClient, shelfId)
                })
                .then((response) => {
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
            Player.action.reset()
                .then(() => {
                    return props.shuffleAll(apiClient, shelfId)
                }).then((response) => {

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
                    onPress={() => { props.toggleShowPlaylisted(routes, navPush, shelfId, showPlaylisted === true ? false : true) }}
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
                <C.SnowCreateJobButton
                    title="Create Job"
                    jobDetails={{
                        metadataId: remoteId,
                        ...props.getJobTarget(shelfId)
                    }} />
            ))
        }
        return (
            <>
                <>
                    <C.SnowText>{pageTitle}</C.SnowText>
                    <C.SnowGrid focusKey="page-entry" focusDown="watchable-items" itemsPerRow={itemsPerRow}>
                        {buttons}
                    </C.SnowGrid>
                </>
                <Grid focusStart focusKey="watchable-items" items={items} />
            </>
        )
    }
    return <C.SnowText>Loading items from shelf {shelfId}.</C.SnowText>
}

export default WatchableListPage
