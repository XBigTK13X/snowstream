import C from '../common'
export default function SignInPage() {
    const { session, routes } = C.useAppContext()
    console.log({ session })
    if (session) {
        return <C.Redirect href={routes.landing} />
    }
    const { apiClient, signIn } = C.useAppContext()
    const [errors, setErrors] = C.React.useState(null)
    const [users, setUsers] = C.React.useState(null)
    const [user, setUser] = C.React.useState(null)
    const [password, setPassword] = C.React.useState("")

    C.React.useEffect(() => {
        console.log({ users })
        if (!users) {
            apiClient.getUserList().then((response) => {
                console.log({ response })
                setUsers(response)
            })
        }
    }, [])

    const selectUser = (user) => {
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

    const login = () => {
        console.log({ user, password })
        signIn(user.username, password)
            .then((result) => {
                if (result.failed) {
                    setErrors("Incorrect password for this user.")
                }
                else {
                    console.log({ result })
                    routes.replace(routes.landing)
                }
            })
            .catch((err) => {
                setErrors(err)
            })
    }

    const cancel = () => {
        setUser(null)
    }


    let passwordForm = null
    if (users && user && user.has_password) {
        passwordForm = (
            <C.View>
                <C.SnowLabel>Enter the password for {user.username}</C.SnowLabel>
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
            <C.SnowLabel>{errors ? 'Errors: ' + JSON.stringify(errors) : ""}</C.SnowLabel>
        </C.View>
    )
}
