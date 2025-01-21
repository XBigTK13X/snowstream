import C from '../../../../common'

export default function UserEditPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [userId, setUserId] = C.React.useState(null)
    const [userDisplayName, setUserDisplayName] = C.React.useState('')
    const [userEnabled, setUserEnabled] = C.React.useState('')
    const [userUsername, setUserUsername] = C.React.useState('')
    const [userPassword, setUserPassword] = C.React.useState('')
    const [userPermissions, setUserPermissions] = C.React.useState('')
    const [userDeleteCount, setUserDeleteCount] = C.React.useState(3)
    const [userDeleted, setUserDeleted] = C.React.useState(false)
    const localParams = C.useLocalSearchParams()

    C.React.useEffect(() => {
        if (!userId && localParams.userId) {
            apiClient.getUser(localParams.userId).then((user) => {
                setUserId(user.id)
                setUserEnabled(user.enabled || true)
                setUserUsername(user.username || '')
                setUserDisplayName(user.display_name || '')
                setUserPermissions(user.permissions || '')
            })
        }
    })
    const saveUser = () => {
        let payload = {
            id: userId,
            username: userUsername,
            displayName: userDisplayName,
            rawPassword: userPassword,
            enabled: !!userEnabled,
            permissions: userPermissions
        }
        apiClient.saveUser(payload)
    }

    const deleteUser = () => {
        if (userDeleteCount > 1) {
            setUserDeleteCount(userDeleteCount - 1)
        }
        else {
            apiClient.deleteUser(userId).then((() => {
                setUserDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (userId) {
        deleteButton = <C.SnowButton title={`Delete User (${userDeleteCount})`} onPress={deleteUser} />
    }
    if (userDeleted) {
        return <C.Redirect href={routes.admin.userList} />
    }

    return (
        <C.View >
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onChangeText={setUserUsername} value={userUsername} />

            <C.SnowLabel>Display Name</C.SnowLabel>
            <C.SnowInput onChangeText={setUserDisplayName} value={userDisplayName} />

            <C.SnowLabel>Enabled</C.SnowLabel>
            <C.SnowInput onChangeText={setUserEnabled} value={userEnabled} />

            <C.SnowLabel>Permissions</C.SnowLabel>
            <C.SnowInput onChangeText={setUserPermissions} value={userPermissions} />

            <C.SnowButton title="Save User" onPress={saveUser} />
            {deleteButton}
        </C.View >
    )
}
