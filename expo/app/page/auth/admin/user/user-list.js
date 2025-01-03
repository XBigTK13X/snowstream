import C from '../../../../common'

export default function LandingPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [users, setUsers] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!users) {
            apiClient.getUsers().then((response) => {
                setUsers(response)
            })
        }
    })

    if (users) {
        const renderItem = (user, itemIndex) => {
            return (
                <C.Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={C.Styles.box}
                    title={user.username}
                    onPress={routes.func(routes.admin.userEdit, { userId: user.id })}
                />
            )

        }
        return (
            <C.View >
                <C.SnowGrid data={users} renderItem={renderItem} />
                <C.SnowText>Loaded content from [{config.webApiUrl}]</C.SnowText>
            </C.View>
        )
    }

    return (
        <C.SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </C.SnowText>
    )
}
