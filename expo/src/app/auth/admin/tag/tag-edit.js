import C from '../../../../common'

export default function TagEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()
    const [tagName, setTagName] = C.React.useState('')
    const [tagId, setTagId] = C.React.useState(null)
    const [tagDeleteCount, setTagDeleteCount] = C.React.useState(3)
    const [tagDeleted, setTagDeleted] = C.React.useState(false)
    const localParams = C.useLocalSearchParams()
    C.React.useEffect(() => {
        if (!tagId && localParams.tagId) {
            apiClient.getTag(localParams.tagId).then((tag) => {
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
        return <C.Redirect href={routes.admin.tagList} />
    }
    return (
        <C.FillView>
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onChangeText={setTagName} value={tagName} />

            <C.SnowTextButton title="Save Tag" onPress={saveTag} />
            {deleteButton}
        </C.FillView >
    )
}
