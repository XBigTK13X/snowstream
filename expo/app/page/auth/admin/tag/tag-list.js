import C from '../../../../common'

export default function TagListPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [tags, setTags] = C.React.useState(null)
    C.React.useEffect(() => {
        if (!tags) {
            apiClient.getTagList().then((response) => {
                setTags(response)
            })
        }
    })

    if (tags && tags.length) {
        const renderItem = (item, itemIndex) => {
            return (
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={C.Styles.box}
                    title={item.name}
                    onPress={routes.func(routes.admin.tagEdit, { tagId: item.id })}
                />
            )
        }
        return (
            <C.View >
                <C.Button title="Create New Tag" onPress={routes.func(routes.admin.tagEdit)} />
                <C.SnowText>{tags.length} tags found</C.SnowText>
                <C.SnowGrid data={tags} renderItem={renderItem} />
            </C.View>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
