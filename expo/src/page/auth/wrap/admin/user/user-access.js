import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

export default function UserEditPage() {
    const { navPush, currentRoute } = Snow.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [userId, setUserId] = C.React.useState(null)
    const [userTags, setUserTags] = C.React.useState([])
    const [userShelves, setUserShelves] = C.React.useState([])
    const [userStreamSources, setUserStreamSources] = C.React.useState([])

    const [tags, setTags] = C.React.useState('')
    const [shelves, setShelves] = C.React.useState('')
    const [streamSources, setStreamSources] = C.React.useState('')

    C.React.useEffect(() => {
        if (!userId && currentRoute.routeParams.userId) {
            apiClient.getUser(currentRoute.routeParams.userId).then((response) => {
                setUserId(currentRoute.routeParams.userId)
                if (response.access_tags) {
                    setUserTags(response.access_tags.map(item => item.id))
                    setUserShelves(response.access_shelves.map(item => item.id))
                    setUserStreamSources(response.access_stream_sources.map(item => item.id))
                }
            })
        }
        if (!tags) {
            apiClient.getTagList().then((tags) => {
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
            userId: userId,
            tagIds: userTags,
            shelfIds: userShelves,
            streamSourceIds: userStreamSources,
        }
        apiClient.saveUserAccess(payload)
    }

    const setShelfAccess = (shelfId, accessible) => {
        if (!accessible) {
            const shelfIndex = userShelves.indexOf(shelfId)
            if (shelfIndex !== -1) {
                let moddedUserShelves = [...userShelves]
                moddedUserShelves.splice(shelfIndex, 1)
                setUserShelves(moddedUserShelves)
            }
        }
        if (accessible) {
            const shelfIndex = userShelves.indexOf(shelfId)
            if (shelfIndex === -1) {
                let modduedUserShelves = [...userShelves]
                modduedUserShelves.push(shelfId)
                setUserShelves(modduedUserShelves)
            }
        }
    }

    const setStreamSourceAccess = (streamSourceId, accessible) => {
        if (!accessible) {
            const streamSourceIndex = userStreamSources.indexOf(streamSourceId)
            if (streamSourceIndex !== -1) {
                let moddedStreamSources = [...userStreamSources]
                moddedStreamSources.splice(streamSourceIndex, 1)
                setUserStreamSources(moddedStreamSources)
            }
        }
        if (accessible) {
            const streamSourceIndex = userStreamSources.indexOf(streamSourceId)
            if (streamSourceIndex === -1) {
                let moddedStreamSources = [...userStreamSources]
                moddedStreamSources.push(streamSourceId)
                setUserStreamSources(moddedStreamSources)
            }
        }
    }

    const setTagAccess = (tagId, accessible) => {
        if (!accessible) {
            const tagIndex = userTags.indexOf(tagId)
            if (tagIndex !== -1) {
                let moddedUserTags = [...userTags]
                moddedUserTags.splice(tagIndex, 1)
                setUserTags(moddedUserTags)
            }
        }
        if (accessible) {
            const tagIndex = userTags.indexOf(tagId)
            if (tagIndex === -1) {
                let moddedUserTags = [...userTags]
                moddedUserTags.push(tagId)
                setUserTags(moddedUserTags)
            }
        }
    }

    let shelfPicker = null
    if (shelves && shelves.length) {
        const renderShelf = (shelf) => {
            if (userShelves && userShelves.indexOf(shelf.id) !== -1) {
                return (
                    <C.SnowTextButton
                        title={shelf.name + ' YES'}
                        onPress={() => {
                            setShelfAccess(shelf.id, false)
                        }}
                    ></C.SnowTextButton>
                )
            }
            return (
                <C.SnowTextButton
                    title={shelf.name + ' NO'}
                    onPress={() => {
                        setShelfAccess(shelf.id, true)
                    }}
                ></C.SnowTextButton>
            )
        }
        shelfPicker = (
            <C.View>
                <C.SnowText>Shelves</C.SnowText>
                <C.SnowGrid short={true} items={shelves} renderItem={renderShelf} />
            </C.View>
        )
    }

    let streamSourcePicker = null
    if (streamSources && streamSources.length) {
        const renderStreamSource = (streamSource) => {
            if (userStreamSources && userStreamSources.indexOf(streamSource.id) !== -1) {
                return (
                    <C.SnowTextButton
                        title={streamSource.name + ' YES'}
                        onPress={() => {
                            setStreamSourceAccess(streamSource.id, false)
                        }}
                    ></C.SnowTextButton>
                )
            }
            return (
                <C.SnowTextButton
                    title={streamSource.name + ' NO'}
                    onPress={() => {
                        setStreamSourceAccess(streamSource.id, true)
                    }}
                ></C.SnowTextButton>
            )
        }
        streamSourcePicker = (
            <C.View>
                <C.SnowText>Stream Sources</C.SnowText>
                <C.SnowGrid short={true} items={streamSources} renderItem={renderStreamSource} />
            </C.View>
        )
    }

    let tagPicker = null
    if (tags && tags.length) {
        const renderTag = (tag) => {
            if (userTags && userTags.indexOf(tag.id) !== -1) {
                return (
                    <C.SnowTextButton
                        title={tag.name + ' YES'}
                        onPress={() => {
                            setTagAccess(tag.id, false)
                        }}
                    ></C.SnowTextButton>
                )
            }
            return (
                <C.SnowTextButton
                    title={tag.name + ' NO'}
                    onPress={() => {
                        setTagAccess(tag.id, true)
                    }}
                ></C.SnowTextButton>
            )
        }
        tagPicker = (
            <C.View>
                <C.SnowText>Tags</C.SnowText>
                <C.SnowGrid short={true} items={tags} renderItem={renderTag} />
            </C.View>
        )
    }

    return (
        <C.View>
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowTextButton title="User Details" onPress={navPush(routes.adminUserEdit, { userId: userId }, true)} />
                <C.SnowTextButton title="User Access" onPress={navPush(routes.adminUserAccess, { userId: userId }, true)} />
            </C.SnowGrid>

            {shelfPicker}
            {streamSourcePicker}
            {tagPicker}

            <C.SnowTextButton title="Save User Access" onPress={saveUserAccess} />
        </C.View>
    )
}
