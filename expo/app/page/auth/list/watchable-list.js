import C from '../../../common'

export function WatchableListPage(props) {
    const { isAdmin, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const { setMessageDisplay } = C.useMessageDisplay()
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
            props.gotoItem(routes, shelfId, item.id, item)
        }

        const toggleWatchedItem = (item) => {
            props.toggleItemWatched(apiClient, item.id).then((watched) => {
                props.loadItems(apiClient, shelfId, currentStatus).then((response) => {
                    setItems(response)
                    setMessageDisplay(`Mark ${item.name} as ${watched ? 'watched' : 'unwatched'}`)
                })
            })
        }

        let Grid = C.SnowPosterGrid
        if (props.gridKind == 'thumb') {
            Grid = C.SnowThumbGrid
        }

        return (
            <C.View>
                <C.SnowText>{pageTitle}</C.SnowText>
                <C.SnowGrid itemsPerRow={isAdmin ? 2 : 1}>
                    <C.SnowTextButton title={'Showing: ' + currentStatus} onPress={nextWatchedStatus} />
                    <C.SnowUpdateMediaButton
                        kind={props.kind}
                        updateMediaJob={(details) => {
                            details.shelfId = shelfId
                            props.updateMediaJob(apiClient, details)
                        }}
                    />
                </C.SnowGrid>
                <Grid shouldFocus onPress={gotoItem} onLongPress={toggleWatchedItem} items={items} />
            </C.View >
        )
    }
    return <C.SnowText>Loading items from shelf {localParams.shelfId}.</C.SnowText>
}

export default WatchableListPage
