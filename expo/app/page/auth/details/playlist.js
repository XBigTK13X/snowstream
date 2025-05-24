import C from '../../../common'

export default function PlaylistDetailsPage() {
    const { isAdmin, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()

    const tagId = localParams.tagId
    const tagName = localParams.tagName

    const [playlistItems, setPlaylistItems] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!playlistItems) {
            apiClient.getPlaylist(tagId).then((response) => {
                setPlaylistItems(response)
            })
        }
    })
    if (!playlistItems) {
        return <C.Text>Loading playlist {tagName}.</C.Text>
    }

    gotoItem = (item) => { }

    shuffle = () => {

    }

    return (
        <C.View>
            <C.SnowTextButton title="Shuffle" onPress={shuffle} />
            <C.SnowPosterGrid items={playlistItems} onPress={gotoItem} />
        </C.View>
    )
}
