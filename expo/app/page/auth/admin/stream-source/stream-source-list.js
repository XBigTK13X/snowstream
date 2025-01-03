import C from '../../../../common'

export default function LandingPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [shelves, setShelves] = C.React.useState(null)
    const [streamSources, setStreamSources] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!shelves) {
            apiClient.getShelves().then((response) => {
                setShelves(response)
            })
        }
        if (!streamSources) {
            apiClient.getStreamSources().then((response) => {
                setStreamSources(response)
            })
        }
    })


    if (streamSources) {
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
