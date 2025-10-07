import { C } from 'snowstream'

export default function StreamSourceListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [streamSources, setStreamSources] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!streamSources) {
            apiClient.getStreamSourceList().then((response) => {
                setStreamSources(response)
            })
        }
    })


    if (!!streamSources) {
        const renderItem = (streamSource, itemIndex) => {
            return (
                <C.SnowTextButton
                    title={streamSource.name}
                    onPress={routes.func(routes.admin.streamSourceEdit, {
                        streamSourceId: streamSource.id,
                    })}
                />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton focusStart focusKey='page-entry' focusDown='item-list' title="Create New Stream Source" onPress={routes.func(routes.admin.streamSourceEdit)} />
                <C.SnowText>{streamSources.length} stream sources found</C.SnowText>
                <C.SnowGrid focusKey='item-list' items={streamSources} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
