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
                    onPress={navPush({
                        path: routes.adminTagEdit,
                        params: { tagId: item.id }
                    })}
                />
            )
        }
        return (
            <>
                <C.SnowTextButton title="Create New Tag" onPress={navPush({ path: routes.adminTagEdit })} />
                <C.SnowText>{tags.length} tags found</C.SnowText>
                <C.SnowGrid items={tags} renderItem={renderItem} />
            </>
        )
    }

    return null
}
