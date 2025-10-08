import { C, useAppContext } from 'snowstream'

export default function GuideSourceListPage() {
    const { apiClient, routes, navPush } = useAppContext()
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
                    onPress={navPush(routes.admin.channelGuideSourceEdit, {
                        guideSourceId: guideSource.id,
                    }, true)}
                />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton title="Create New Channel Guide Source" onPress={navPush(routes.admin.channelGuideSourceEdit, true)} />
                <C.SnowText>{channelGuideSources.length} stream sources found</C.SnowText>
                <C.SnowGrid items={channelGuideSources} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
