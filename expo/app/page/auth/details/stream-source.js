import C from '../../../common'

//TODO This should be a streamable list page, not stream source details
export default function StreamSourcePage() {
    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const localParams = C.useLocalSearchParams()
    const [streamSource, setStreamSource] = C.React.useState(null)
    C.React.useEffect(() => {
        if (!streamSource) {
            apiClient.getStreamSource(localParams.streamSourceId).then((response) => {
                setStreamSource(response)
            })
        }
    })

    if (streamSource && streamSource.streamables) {
        const renderItem = (streamable, itemIndex) => {
            return (
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    key={streamable.id}
                    title={streamable.name}
                    onPress={routes.func(routes.playMedia, {
                        streamSourceId: streamSource.id,
                        streamableId: streamable.id,
                    })}
                />
            )
        }
        return (
            <C.SnowGrid data={streamSource.streamables} renderItem={renderItem} />
        )
    }
    return <C.Text>Loading stream source {localParams.streamSourceId}.</C.Text>
}
