import C from '../../../../common'

export default function ShelfListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
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
                    shouldFocus={itemIndex === 0}
                    style={C.Styles.box}
                    title={destination.name}
                    onPress={routes.func(routes.admin.shelfEdit, { shelfId: destination.id })}
                />
            )
        }
        return (
            <C.View >
                <C.SnowTextButton title="Create New Shelf" onPress={routes.func(routes.admin.shelfEdit)} />
                {
                    destinations.length > 0 ?
                        <>
                            <C.SnowText>{destinations.length} shelves found</C.SnowText>
                            <C.SnowGrid items={destinations} renderItem={renderItem} />
                        </>
                        : null
                }
            </C.View>
        )
    }

    return null
}
