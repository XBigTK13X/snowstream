import C from '../../../../common'

export default function ShelfListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
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
                    hasTVPreferredFocus={itemIndex === 0}
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
                            <C.SnowGrid data={destinations} renderItem={renderItem} />
                        </>
                        : null
                }
            </C.View>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
