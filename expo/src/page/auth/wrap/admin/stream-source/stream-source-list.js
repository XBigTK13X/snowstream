import { C, useAppContext } from 'snowstream'

export default function StreamSourceListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
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
                    onPress={navPush(routes.adminStreamSourceEdit, {
                        streamSourceId: streamSource.id,
                    }, true)}
                />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton focusStart focusKey='page-entry' focusDown='item-list' title="Create New Stream Source" onPress={navPush(routes.adminStreamSourceEdit, true)} />
                <C.SnowText>{streamSources.length} stream sources found</C.SnowText>
                <C.SnowGrid focusKey='item-list' items={streamSources} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
