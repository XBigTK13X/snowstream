import C from '../../../common'

export function WatchableListPage(props) {
    const { isAdmin, apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const { setMessageDisplay } = C.useAppContext()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)
    const shelfId = localParams.shelfId
    let currentStatus = localParams.watchStatus || 'Unwatched'
    let nextStatus = 'Watched'
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (shelf && !items) {
            props.loadItems(apiClient, shelfId, currentStatus).then((response) => {
                setItems(response)
                if (response.length == 0) {
                    setMessageDisplay(`Found no items to display.`)
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
    if (shelf && items) {
        let pageTitle = `Found ${items.length} items from shelf ${shelf.name}`
        if (props.getPageTitle) {
            pageTitle = props.getPageTitle(shelf, items)
        }
        const nextWatchedStatus = () => {
            if (currentStatus == 'Unwatched') {
                nextStatus = 'Watched'
            }
            if (currentStatus == 'Watched') {
                nextStatus = 'All'
            }
            if (currentStatus == 'All') {
                nextStatus = 'Unwatched'
            }
            props.refreshList(routes, shelfId, nextStatus)
        }

        const gotoItem = (item) => {
            routes.gotoItem(item)
        }

        const toggleWatchedItem = (item) => {
            props.toggleItemWatched(apiClient, item.id).then((watched) => {
                props.loadItems(apiClient, shelfId, currentStatus).then((response) => {
                    setItems(response)
                    setMessageDisplay(`Mark ${item.name} as ${watched ? 'watched' : 'unwatched'}`)
                })
            })
        }

        const watchAll = () => {
            props.watchAll(apiClient).then(response => {
                routes.goto(routes.playMedia, { playingQueueSource: response.source })
            })
        }

        const shuffleAll = () => {
            props.shuffleAll(apiClient).then(response => {
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

        return (
            <C.View>
                <C.SnowText>{pageTitle}</C.SnowText>
                <C.SnowGrid itemsPerRow={isAdmin ? 3 : 1}>
                    <C.SnowTextButton title={'Showing: ' + currentStatus} onPress={nextWatchedStatus} />
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
                                props.updateMediaJob(apiClient, details)
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
