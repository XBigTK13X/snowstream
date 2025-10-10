import { C, useAppContext } from 'snowstream'

export default function TagListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
    const [tags, setTags] = C.React.useState(null)
    C.React.useEffect(() => {
        if (!tags) {
            apiClient.getTagList().then((response) => {
                setTags(response)
            })
        }
    })

    if (!!tags) {
        const renderItem = (item, itemIndex) => {
            return (
                <C.SnowTextButton
                    title={item.name}
                    onPress={navPush(routes.adminTagEdit, { tagId: item.id }, true)}
                />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton title="Create New Tag" onPress={navPush(routes.adminTagEdit, true)} />
                <C.SnowText>{tags.length} tags found</C.SnowText>
                <C.SnowGrid items={tags} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
