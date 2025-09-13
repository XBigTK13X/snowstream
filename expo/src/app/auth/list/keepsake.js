import C from '../../../common'

export function KeepsakeListPage(props) {
    const localParams = C.useLocalSearchParams()
    const shelfId = localParams.shelfId

    const { isAdmin, apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const [shelf, setShelf] = C.React.useState(null)
    const [rootKeepsake, setRootKeepsake] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)


    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            }).then(() => {
                apiClient.getKeepsakeList(shelfId).then((response) => {
                    setItems(response.top_levels)
                    setRootKeepsake(response.root_keepsake)
                })
            })

        }
    })
    if (shelf && items && rootKeepsake) {
        let pageTitle = `Found ${items.length} items from shelf ${shelf.name}`

        const gotoItem = (item) => {
            let payload = { rootKeepsakeId: rootKeepsake.id }
            if (item.name !== '=-=root=-=') {
                payload.subdirectory = item.path
            }
            routes.goto(routes.keepsakeDetails, payload)
        }

        return (
            <C.View>
                <C.SnowText>{pageTitle}</C.SnowText>
                <C.SnowGrid itemsPerRow={2}>
                    {items.map((item, itemIndex) => {
                        return (
                            <C.SnowTextButton key={itemIndex} title={item.display} onPress={() => { gotoItem(item) }} />
                        )
                    })}
                </C.SnowGrid>
            </C.View >
        )
    }
    return <C.SnowText>Loading items from shelf {localParams.shelfId}.</C.SnowText>
}

export default KeepsakeListPage
