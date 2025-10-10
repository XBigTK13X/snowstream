import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

export default function UserEditPage() {
    const { navPush, currentRoute } = Snow.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [userId, setUserId] = C.React.useState(null)
    const [userDisplayName, setUserDisplayName] = C.React.useState('')
    const [userEnabled, setUserEnabled] = C.React.useState('')
    const [userUsername, setUserUsername] = C.React.useState('')
    const [userPassword, setUserPassword] = C.React.useState('')
    const [userPermissions, setUserPermissions] = C.React.useState('')
    const [userDeleteCount, setUserDeleteCount] = C.React.useState(3)
    const [userDeleted, setUserDeleted] = C.React.useState(false)
    const [userHasPassword, setUserHasPassword] = C.React.useState(false)

    C.React.useEffect(() => {
        if (userId == null && currentRoute.routeParams.userId) {
            apiClient.getUser(currentRoute.routeParams.userId).then((user) => {
                if (user) {
                    setUserId(user.id)
                    setUserEnabled(user.enabled || true)
                    setUserUsername(user.username || '')
                    setUserDisplayName(user.display_name || '')
                    setUserPermissions(user.permissions || '')
                    setUserHasPassword(user.has_password)
                }
            })
        }
    })
    const saveUser = () => {
        let payload = {
            id: userId,
            username: userUsername,
            displayName: userDisplayName,
            enabled: !!userEnabled,
            permissions: userPermissions
        }
        if (userPassword) {
            if (userUsername !== 'admin' || userPassword !== 'SNOWSTREAM_EMPTY') {
                payload.rawPassword = userPassword
                payload.setPassword = true
            }
        }
        apiClient.saveUser(payload).then(() => {
            setUserPassword('')
            setUserId(null)
        })
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
        deleteButton = <C.SnowTextButton title={`Delete User (${userDeleteCount})`} onPress={deleteUser} />
    }
    if (userDeleted) {
        return <C.Redirect href={routes.adminUserList} />
    }

    let existingUserControls = null
    if (userId) {
        existingUserControls = (
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowTextButton title="User Details" onPress={navPush(routes.adminUserEdit, { userId: userId }, true)} />
                <C.SnowTextButton title="User Access" onPress={navPush(routes.adminUserAccess, { userId: userId }, true)} />
            </C.SnowGrid>
        )
    }

    return (
        <C.View>
            {existingUserControls}
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={setUserUsername} value={userUsername} />

            <C.SnowLabel>Display Name</C.SnowLabel>
            <C.SnowInput onValueChange={setUserDisplayName} value={userDisplayName} />

            <C.SnowLabel>Enabled</C.SnowLabel>
            <C.SnowInput onValueChange={setUserEnabled} value={userEnabled} />

            <C.SnowLabel>Permissions</C.SnowLabel>
            <C.SnowInput onValueChange={setUserPermissions} value={userPermissions} />

            <C.SnowLabel>Change Password (Currently {userHasPassword ? 'Set' : 'None'})</C.SnowLabel>
            <C.SnowText>Set to "SNOWSTREAM_EMPTY" for a no password user (nonadmin only).</C.SnowText>
            <C.SnowInput onValueChange={setUserPassword} value={userPassword} />

            <C.SnowTextButton title="Save User" onPress={saveUser} />
            {deleteButton}
        </C.View >
    )
}
