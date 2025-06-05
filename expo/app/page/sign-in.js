import C from '../common'
export default function SignInPage() {
    const { signIn, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [errors, setErrors] = C.React.useState(null)
    const [users, setUsers] = C.React.useState(null)
    const [user, setUser] = C.React.useState(null)
    const [password, setPassword] = C.React.useState("")

    C.React.useEffect(() => {
        if (!users) {
            apiClient.getUserList().then((response) => {
                setUsers(response)
            })
        }
    })

    function selectUser(user) {
        if (user.has_password) {
            setUser(user)
        }
        else {
            signIn(user.username, 'SNOWSTREAM_EMPTY')
                .then(() => {
                    routes.replace(routes.landing)
                })
                .catch((err) => {
                    setErrors(err)
                })
        }

    }

    function login() {
        signIn(user.username, password)
            .then(() => {
                routes.replace(routes.landing)
            })
            .catch((err) => {
                setErrors(err)
            })
    }

    function cancel() {
        setUser(null)
    }


    let passwordForm = null
    if (users && user && user.has_password) {
        passwordForm = (
            <C.View>
                <C.SnowText>Enter the password for {user.username}</C.SnowText>
                <C.SnowLabel>Password</C.SnowLabel>
                <C.SnowInput secureTextEntry onSubmit={login} shouldFocus onChangeText={setPassword} value={password} />
                <C.SnowGrid itemsPerRow={2} >
                    <C.SnowTextButton title="Login" onPress={login} />
                    <C.SnowTextButton title="Cancel" onPress={cancel} />
                </C.SnowGrid>
            </C.View>
        )
    }

    let userList = null
    if (users && !user) {
        let renderItem = (item) => {
            return <C.SnowTextButton
                title={item.username}
                onPress={() => { selectUser(item) }}
            />
        }
        userList = (
            <C.SnowGrid items={users} renderItem={renderItem} />
        )
    }

    return (
        <C.View>
            {userList}
            {passwordForm}
            <C.SnowText>{errors ? JSON.stringify(errors) : ""}</C.SnowText>
        </C.View>
    )
}
