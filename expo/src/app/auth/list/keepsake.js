import C from '../../../common'

export function KeepsakeListPage(props) {
    const localParams = C.useLocalSearchParams()
    const shelfId = localParams.shelfId

    const { isAdmin, apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const [shelf, setShelf] = C.React.useState(null)
    const [items, setItems] = C.React.useState(null)


    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
            apiClient.getKeepsakeList(shelfId).then((response) => {
                setItems(response)
            })
        }
    })
    if (shelf && items) {
        let pageTitle = `Found ${items.length} items from shelf ${shelf.name}`

        const gotoItem = (item) => {
            routes.goto(routes.keepsakeDetails, { keepsakeId: item.id })
        }

        return (
            <C.View>
                <C.SnowText>{pageTitle}</C.SnowText>
                <C.SnowGrid itemsPerRow={2}>
                    {items.map((item, itemIndex) => {
                        return (
                            <C.SnowTextButton key={itemIndex} title={item.name} onPress={() => { gotoItem(item) }} />
                        )
                    })}
                </C.SnowGrid>
            </C.View >
        )
    }
    return <C.SnowText>Loading items from shelf {localParams.shelfId}.</C.SnowText>
}

export default KeepsakeListPage
