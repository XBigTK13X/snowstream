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

    return (
        <C.View >
            <C.SnowButton title="User Details" onPress={routes.func(routes.admin.userEdit, { userId: userId })} />
            <C.SnowButton title="User Access" onPress={routes.func(routes.admin.userAccess, { userId: userId })} />



            <C.SnowButton title="Save User Access" onPress={saveUserAccess} />
        </C.View >
    )
}
