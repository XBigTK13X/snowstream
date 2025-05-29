import C from '../../../../common'

export default function UserListPage() {
    const { apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
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
                    shouldFocus={itemIndex === 0}
                    style={C.Styles.box}
                    title={user.username || user.display_name}
                    onPress={routes.func(routes.admin.userEdit, { userId: user.id })}
                />
            )

        }
        return (
            <C.View >
                <C.SnowTextButton title="Create New User" onPress={routes.func(routes.admin.userEdit)} />
                <C.SnowText>{users.length} users found</C.SnowText>
                <C.SnowGrid items={users} renderItem={renderItem} />
            </C.View>
        )
    }

    return null
}
