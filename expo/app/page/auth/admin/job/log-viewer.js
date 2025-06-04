import C from '../../../../common'

export default function LogViewerPage() {
    const localParams = C.useLocalSearchParams()
    const { apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [logPaths, setLogPaths] = C.React.useState(null)
    const [logContent, setLogContent] = C.React.useState('')
    C.React.useEffect(() => {
        if (!logPaths) {
            apiClient.getLogPaths().then((response) => {
                setLogPaths(response)
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
        <C.View>
            <C.SnowGrid items={logPaths} renderItem={(item, itemIndex) => {
                return <C.SnowTextButton title={item} onPress={() => {
                    loadLog(itemIndex)
                }} />
            }} />
            <C.SnowText>{logContent}</C.SnowText>
        </C.View>
    )
}
