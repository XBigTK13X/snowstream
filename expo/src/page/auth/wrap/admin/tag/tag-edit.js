import { C, useAppContext } from 'snowstream'

export default function TagEditPage() {
    const { apiClient, routes, currentRoute } = useAppContext()

    const [tagName, setTagName] = C.React.useState('')
    const [tagId, setTagId] = C.React.useState(null)
    const [tagDeleteCount, setTagDeleteCount] = C.React.useState(3)
    const [tagDeleted, setTagDeleted] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!tagId && currentRoute.routeParams.tagId) {
            apiClient.getTag(currentRoute.routeParams.tagId).then((tag) => {
                setTagId(tag.id)
                setTagName(tag.name)
            })
        }
    })
    const saveTag = () => {
        let tag = {
            id: tagId,
            name: tagName
        }
        apiClient.saveTag(tag)
    }

    const deleteTag = () => {
        if (tagDeleteCount > 1) {
            setTagDeleteCount(tagDeleteCount - 1)
        }
        else {
            apiClient.deleteTag(tagId).then((() => {
                setTagDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (tagId) {
        deleteButton = <C.SnowTextButton title={`Delete Tag (${tagDeleteCount})`} onPress={deleteTag} />
    }
    if (tagDeleted) {
        return <C.Redirect href={routes.adminTagList} />
    }
    return (
        <C.View>
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={setTagName} value={tagName} />

            <C.SnowTextButton title="Save Tag" onPress={saveTag} />
            {deleteButton}
        </C.View >
    )
}
