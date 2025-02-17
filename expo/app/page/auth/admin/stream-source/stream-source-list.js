import C from '../../../../common'

export default function StreamSourceListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
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
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={C.Styles.box}
                    title={streamSource.name}
                    onPress={routes.func(routes.admin.streamSourceEdit, {
                        streamSourceId: streamSource.id,
                    })}
                />
            )
        }
        return (
            <C.View >
                <C.SnowButton title="Create New Stream Source" onPress={routes.func(routes.admin.streamSourceEdit)} />
                <C.SnowText>{streamSources.length} stream sources found</C.SnowText>
                <C.SnowGrid data={streamSources} renderItem={renderItem} />
            </C.View>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
