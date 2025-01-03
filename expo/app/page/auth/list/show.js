import C from '../../../common'

export default function ShowListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [shelf, setShelf] = C.React.useState(null)
    const [shows, setShows] = C.React.useState(null)
    const shelfId = localParams.shelfId
    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
        }
        if (!shows) {
            apiClient.getShowList(shelfId).then((response) => {
                setShows(response)
            })
        }
    })
    if (shelf && shows) {
        const renderItem = (show, itemIndex) => {
            let posterUrl = null
            for (let image of show.image_files) {
                if (image.kind === 'show_poster') {
                    posterUrl = image.web_path
                }
            }
            if (posterUrl) {
                return (
                    <C.Button
                        hasTVPreferredFocus={itemIndex === 0}
                        title={show.name}
                        icon={<C.Image style={{ height: 100, width: 50 }} key={show.id} source={{ uri: posterUrl }} />}
                        onPress={routes.func(routes.seasonList, { shelfId: shelf.id, showId: show.id })}
                    />
                )
            }
        }
        return (
            <C.View>
                <C.SnowGrid data={shows} renderItem={renderItem} itemDimensions={200} />
            </C.View>
        )
    }
    return <C.Text style={{ color: 'white' }}>Loading shelf {localParams.shelfId}.</C.Text>
}
