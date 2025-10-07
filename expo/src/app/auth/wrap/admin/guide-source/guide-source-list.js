import { C, useAppContext } from 'snowstream'

export default function GuideSourceListPage() {
    const { apiClient, routes } = useAppContext()
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
                    onPress={routes.func(routes.admin.channelGuideSourceEdit, {
                        guideSourceId: guideSource.id,
                    })}
                />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton title="Create New Channel Guide Source" onPress={routes.func(routes.admin.channelGuideSourceEdit)} />
                <C.SnowText>{channelGuideSources.length} stream sources found</C.SnowText>
                <C.SnowGrid items={channelGuideSources} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
