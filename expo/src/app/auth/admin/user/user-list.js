import C from '../../../../common'

export default function UserListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
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
                    title={user.username || user.display_name}
                    onPress={routes.func(routes.admin.userEdit, { userId: user.id })}
                />
            )

        }
        return (
            <C.FillView>
                <C.SnowTextButton title="Create New User" onPress={routes.func(routes.admin.userEdit)} />
                <C.SnowText>{users.length} users found</C.SnowText>
                <C.SnowGrid items={users} renderItem={renderItem} />
            </C.FillView>
        )
    }

    return null
}
