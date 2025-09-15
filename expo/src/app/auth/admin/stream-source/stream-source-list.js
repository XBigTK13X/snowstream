import C from '../../../../common'

export default function StreamSourceListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [streamSources, setStreamSources] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!streamSources) {
            apiClient.getStreamSourceList(false).then((response) => {
                setStreamSources(response)
            })
        }
    })


    if (!!streamSources) {
        const renderItem = (streamSource, itemIndex) => {
            return (
                <C.SnowTextButton
                    shouldFocus={itemIndex === 0}
                    title={streamSource.name}
                    onPress={routes.func(routes.admin.streamSourceEdit, {
                        streamSourceId: streamSource.id,
                    })}
                />
            )
        }
        return (
            <C.FillView>
                <C.SnowTextButton title="Create New Stream Source" onPress={routes.func(routes.admin.streamSourceEdit)} />
                <C.SnowText>{streamSources.length} stream sources found</C.SnowText>
                <C.SnowGrid items={streamSources} renderItem={renderItem} />
            </C.FillView>
        )
    }

    return null
}
