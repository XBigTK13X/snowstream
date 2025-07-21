import C from '../../../../common'

export default function LogViewerPage() {
    const localParams = C.useLocalSearchParams()
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [logPaths, setLogPaths] = C.React.useState(null)
    const [playbackLogs, setPlaybackLogs] = C.React.useState(null)
    const [logContent, setLogContent] = C.React.useState('')
    C.React.useEffect(() => {
        if (!logPaths) {
            apiClient.getLogPaths().then((response) => {
                setLogPaths(response.server)
                setPlaybackLogs(response.playback)
            })
        }
    })

    const loadLog = (logIndex) => {
        apiClient.getLog(logIndex).then(response => {
            setLogContent(response)
        })
    }

    if (!logPaths) {
        return null
    }

    return (
        <C.FillView>
            <C.SnowGrid shrink itemsPerRow={1} items={logPaths} renderItem={(item, itemIndex) => {
                return <C.SnowTextButton title={item} onPress={() => {
                    loadLog(itemIndex)
                }} />
            }} />
            <C.SnowGrid shrink itemsPerRow={1} items={playbackLogs} renderItem={(item, itemIndex) => {
                return <C.SnowTextButton title={item.key} onPress={() => {
                    setLogContent(item.data)
                }} />
            }} />
            <C.SnowText>{logContent}</C.SnowText>
        </C.FillView>
    )
}
