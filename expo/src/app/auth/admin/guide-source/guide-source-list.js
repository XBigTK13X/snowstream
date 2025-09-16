import C from '../../../../common'

export default function GuideSourceListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
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
                    shouldFocus={itemIndex === 0}
                    title={guideSource.name}
                    onPress={routes.func(routes.admin.guideSourceEdit, {
                        guideSourceId: guideSource.id,
                    })}
                />
            )
        }
        return (
            <C.FillView>
                <C.SnowTextButton title="Create New Channel Guide Source" onPress={routes.func(routes.admin.channelGuideSourceEdit)} />
                <C.SnowText>{channelGuideSources.length} stream sources found</C.SnowText>
                <C.SnowGrid items={channelGuideSources} renderItem={renderItem} />
            </C.FillView>
        )
    }

    return null
}
