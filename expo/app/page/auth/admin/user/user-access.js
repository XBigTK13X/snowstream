import C from '../../../../common'

export default function UserEditPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()

    const [userId, setUserId] = C.React.useState(null)
    const [userTags, setUserTags] = C.React.useState('')
    const [userShelves, setUserShelves] = C.React.useState('')
    const [userStreamSources, setUserStreamSources] = C.React.useState('')

    const [tags, setTags] = C.React.useState('')
    const [shelves, setShelves] = C.React.useState('')
    const [streamSources, setStreamSources] = C.React.useState('')

    const localParams = C.useLocalSearchParams()

    C.React.useEffect(() => {
        if (!userId && localParams.userId) {
            apiClient.getUser(localParams.userId, true).then((response) => {
                setUserTags(response.tags)
                setUserShelves(response.shelves)
                setUserStreamSources(response.streamSources)
            })
        }
        if (!tags) {
            apiClient.getTags().then((tags) => {
                setTags(tags)
            })
        }
        if (!shelves) {
            apiClient.getShelfList().then((shelves) => {
                setShelves(shelves)
            })
        }
        if (!streamSources) {
            apiClient.getStreamSourceList().then((streamSources) => {
                setStreamSources(streamSources)
            })
        }
    })
    const saveUserAccess = () => {
        let payload = {
            id: userId,
            tags: userTags,
            shelves: userShelves,
            streamSources: userStreamSources
        }
        apiClient.saveUserAccess(payload)
    }

    const setShelfAccess = (shelfId, accessible) => {
        console.log({ shelfId, accessible })
    }

    let shelfPicker = null
    if (shelves && shelves.length) {
        const renderShelf = (shelf) => {
            if (!userShelves || userShelves.indexOf(shelf.id) !== -1) {
                return (
                    <C.SnowButton title={shelf.name + " YES"} onPress={() => { setShelfAccess(shelf.id, false) }}></C.SnowButton>
                )
            }
            return (
                <C.SnowButton title={shelf.name + " NO"} onPress={() => { setShelfAccess(shelf.id, true) }}></C.SnowButton>
            )
        }
        shelfPicker = (
            <C.View>
                <C.SnowText>Shelves</C.SnowText>
                <C.SnowGrid short={true} data={shelves} renderItem={renderShelf} />
            </C.View>
        )
    }


    let streamSourcePicker = null
    if (streamSources && streamSources.length) {
        const renderStreamSource = (streamSource) => {
            if (!userStreamSources || userStreamSources.indexOf(streamSource.id) !== -1) {
                return (
                    <C.SnowButton title={streamSource.name + " YES"} onPress={() => { setStreamSourceAccess(streamSource.id, false) }}></C.SnowButton>
                )
            }
            return (
                <C.SnowButton title={streamSource.name + " NO"} onPress={() => { setStreamSourceAccess(streamSource.id, true) }}></C.SnowButton>
            )
        }
        streamSourcePicker = (
            <C.View>
                <C.SnowText>Stream Sources</C.SnowText>
                <C.SnowGrid short={true} data={streamSources} renderItem={renderStreamSource} />
            </C.View>
        )
    }

    let tagPicker = null
    if (tags && tags.length) {
        const renderTag = (tag) => {
            if (!userTags || userTags.indexOf(tag.id) !== -1) {
                return (
                    <C.SnowButton title={tag.name + " YES"} onPress={() => { setTagAccess(tag.id, false) }}></C.SnowButton>
                )
            }
            return (
                <C.SnowButton title={tag.name + " NO"} onPress={() => { setTagAccess(tag.id, true) }}></C.SnowButton>
            )
        }
        tagPicker = (
            <C.View>
                <C.SnowText>Tags</C.SnowText>
                <C.SnowGrid short={true} data={tags} renderItem={renderTag} />
            </C.View>
        )
    }

    return (
        <C.View >
            <C.SnowButton title="User Details" onPress={routes.func(routes.admin.userEdit, { userId: userId })} />
            <C.SnowButton title="User Access" onPress={routes.func(routes.admin.userAccess, { userId: userId })} />

            {shelfPicker}
            {streamSourcePicker}
            {tagPicker}

            <C.SnowButton title="Save User Access" onPress={saveUserAccess} />
        </C.View >
    )
}
