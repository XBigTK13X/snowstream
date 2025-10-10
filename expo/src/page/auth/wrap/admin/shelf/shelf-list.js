import { C, useAppContext } from 'snowstream'

export default function ShelfListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
    const [shelves, setShelves] = C.React.useState(null)
    C.React.useEffect(() => {
        if (!shelves) {
            apiClient.getShelfList().then((response) => {
                setShelves(response)
            })
        }
    })

    let destinations = []

    if (!!shelves) {
        destinations = destinations.concat(shelves)
    }

    if (!!shelves) {
        const renderItem = (item, itemIndex) => {
            let destination = item
            return (
                <C.SnowTextButton
                    title={destination.name}
                    onPress={navPush(routes.adminShelfEdit, { shelfId: destination.id }, true)}
                />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton focusStart focusKey='page-entry' focusDown='item-list' title="Create New Shelf" onPress={navPush(routes.adminShelfEdit, true)} />
                {
                    destinations.length > 0 ?
                        <>
                            <C.SnowText>{destinations.length} shelves found</C.SnowText>
                            <C.SnowGrid focusKey="item-list" items={destinations} renderItem={renderItem} />
                        </>
                        : null
                }
            </C.View>
        )
    }

    return null
}
