import C from '../common'
export default function SignInPage() {
    const { signIn, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [errors, setErrors] = C.React.useState(null)
    const [users, setUsers] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!users) {
            apiClient.getUserList().then((response) => {
                setUsers(response)
            })
        }
    })

    function clickSignIn(username, password) {
        signIn(username, password)
            .then(() => {
                routes.replace(routes.landing)
            })
            .catch((err) => {
                setErrors(err)
            })
    }

    let userList = null
    if (users) {
        // TODO Don't hardcord the admin login
        // TODO Allow text entry for both fields
        let renderItem = (item) => {
            return <C.Button
                title={item.username}
                onPress={() => { clickSignIn(item.username, item.username == 'admin' ? 'admin' : '_-_-_EMPTY_-_-_') }}
            />
        }
        userList = (
            <C.SnowGrid data={users} renderItem={renderItem} />
        )
    }

    return (
        <C.View>
            {userList}
            <C.Text>{errors ? JSON.stringify(errors) : "Waiting on login"}</C.Text>
        </C.View>
    )
}
