import { C, useAppContext } from 'snowstream'

export default function UserListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
    const [users, setUsers] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!users) {
            apiClient.getUserList().then((response) => {
                setUsers(response)
            })
        }
    })

    if (!!users) {
        const renderItem = (user, itemIndex) => {
            return (
                <C.SnowTextButton
                    title={user.username || user.display_name}
                    onPress={navPush(routes.adminUserEdit, { userId: user.id }, true)}
                />
            )

        }
        return (
            <C.View>
                <C.SnowTextButton title="Create New User" onPress={navPush(routes.adminUserEdit, true)} />
                <C.SnowText>{users.length} users found</C.SnowText>
                <C.SnowGrid items={users} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
