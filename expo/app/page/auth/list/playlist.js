import C from '../../../common'

export default function PlaylistListPage() {
    const { isAdmin, apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [playlistList, setPlaylistList] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!playlistList) {
            apiClient.getPlaylistList().then((response) => {
                setPlaylistList(response)
            })
        }
    })
    if (!playlistList) {
        return <C.Text>Loading playlist list.</C.Text>
    }

    return <C.SnowGrid items={playlistList} renderItem={(item) => {
        return <C.SnowTextButton title={item.name} onPress={routes.func(routes.playlistDetails, {
            tagId: item.id,
            tagName: item.name
        })} />
    }} />
}
