import C from '../../../../common'

const styles = C.StyleSheet.create({
    boxContainer: {},
    image: {},
    box: {
        padding: 5,
        margin: 5,
        width: '100%',
        height: '100%'
    },
})

export default function LandingPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [shelves, setShelves] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!shelves) {
            apiClient.getShelves().then((response) => {
                setShelves(response)
            })
        }
    })

    let destinations = []

    if (shelves) {
        destinations = destinations.concat(shelves)
    }

    if (shelves) {
        const renderItem = (item, itemIndex) => {
            let destination = item
            return (
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={styles.box}
                    title={destination.name}
                    onPress={routes.func(routes.admin.editShelf, { shelfId: destination.id })}
                />
            )
        }
        return (
            <C.View >
                <C.Button title="Create New Shelf" onPress={routes.func(routes.admin.createShelf)} />
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
