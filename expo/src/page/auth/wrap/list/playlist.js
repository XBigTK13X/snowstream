import { C, useAppContext } from 'snowstream'

export default function PlaylistListPage() {
    const { apiClient } = useAppContext()
    const [playlistList, setPlaylistList] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!playlistList) {
            apiClient.getPlaylistList().then((response) => {
                setPlaylistList(response)
            })
        }
    }, [playlistList])
    if (!playlistList) {
        return <C.SnowLabel center> Loading playlist list.</C.SnowLabel>
    }

    if (!playlistList.length) {
        return < C.SnowText > No playlists found.</C.SnowText >
    }

    return (
        <C.SnowPosterGrid focusStart focusKey="page-entry" items={playlistList} />
    )
}
