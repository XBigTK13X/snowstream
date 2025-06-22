import C from '../../../../common'

export default function TagListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
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
                    shouldFocus={itemIndex === 0}
                    title={item.name}
                    onPress={routes.func(routes.admin.tagEdit, { tagId: item.id })}
                />
            )
        }
        return (
            <C.View >
                <C.SnowTextButton title="Create New Tag" onPress={routes.func(routes.admin.tagEdit)} />
                <C.SnowText>{tags.length} tags found</C.SnowText>
                <C.SnowGrid items={tags} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
