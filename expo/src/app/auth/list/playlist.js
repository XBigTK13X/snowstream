import C from '../../../common'

export default function PlaylistListPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const [playlistList, setPlaylistList] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!playlistList) {
            apiClient.getPlaylistList().then((response) => {
                setPlaylistList(response)
            })
        }
    }, [playlistList])
    if (!playlistList) {
        return <C.SnowText>Loading playlist list.</C.SnowText>
    }

    if (!playlistList.length) {
        return < C.SnowText > No playlists found.</C.SnowText >
    }

    return (
        <C.SnowPosterGrid items={playlistList} />
    )
}
