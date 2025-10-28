import { C, useAppContext } from 'snowstream'

export default function GuideSourceListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
    const [channelGuideSources, setChannelGuideSources] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!channelGuideSources) {
            apiClient.getChannelGuideSourceList().then((response) => {
                setChannelGuideSources(response)
            })
        }
    })


    if (!!channelGuideSources) {
        const renderItem = (guideSource, itemIndex) => {
            return (
                <C.SnowTextButton
                    title={guideSource.name}
                    onPress={navPush({
                        path: routes.adminChannelGuideSourceEdit,
                        params: {
                            guideSourceId: guideSource.id,
                        }
                    })}
                />
            )
        }
        return (
            <>
                <C.SnowTextButton title="Create New Channel Guide Source" onPress={navPush({ path: routes.adminChannelGuideSourceEdit })} />
                <C.SnowText>{channelGuideSources.length} stream sources found</C.SnowText>
                <C.SnowGrid items={channelGuideSources} renderItem={renderItem} />
            </>
        )
    }

    return null
}
