import C from '../common'
export default function SignInPage() {
    const { session, routes, setWebApiUrl } = C.useAppContext()
    if (session) {
        return <C.Redirect href={routes.landing} />
    }
    const { apiClient, signIn, config, clientOptions } = C.useAppContext()
    const [errors, setErrors] = C.React.useState(null)
    const [users, setUsers] = C.React.useState(null)
    const [user, setUser] = C.React.useState(null)
    const [customServer, setCustomServer] = C.React.useState('')
    const [password, setPassword] = C.React.useState("")
    const { pushFocusLayer, popFocusLayer } = C.useFocusContext()
    C.React.useEffect(() => {
        pushFocusLayer("index")
        return () => {
            popFocusLayer()
        }
    }, [])

    C.React.useEffect(() => {
        if (!users && apiClient && clientOptions) {
            apiClient.getUserList(clientOptions.deviceProfile).then((response) => {
                setUsers(response)
            })
        }
    })

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
        signIn(user.username, password)
            .then((result) => {
                if (result.failed) {
                    setErrors("Incorrect password for this user.")
                }
                else {
                    routes.replace(routes.landing)
                }
            })
            .catch((err) => {
                setErrors(err)
            })
    }

    const cancel = () => {
        setPassword('')
        setUser(null)
    }

    const chooseServer = (serverUrl) => {
        setUsers(null)
        setWebApiUrl(serverUrl)
    }


    const applyCustomServer = () => {
        setUsers(null)
        setWebApiUrl(customServer)
    }

    let passwordForm = null
    let userList = null
    let selectServer = null
    if (users && user && user.has_password) {
        passwordForm = (
            <C.View>
                <C.SnowLabel>Enter the password for {user.username}</C.SnowLabel>
                <C.SnowInput
                    focusStart
                    focusKey="password"
                    focusDown="login"
                    secureTextEntry
                    onSubmit={login}
                    onValueChange={setPassword}
                    value={password}
                />
                <C.SnowGrid focusKey="login" itemsPerRow={2} >
                    <C.SnowTextButton title="Login" onPress={login} />
                    <C.SnowTextButton title="Cancel" onPress={cancel} />
                </C.SnowGrid>
            </C.View>
        )
    } else {
        selectServer = (
            <C.View>
                <C.View>
                    <C.SnowLabel center>Choose a server to use.</C.SnowLabel>
                    <C.SnowGrid
                        focusStart={!!users ? false : true}
                        focusKey="servers"
                        focusDown="password-input"
                        itemsPerRow={4} >
                        <C.SnowTextButton title="Beast" onPress={() => { chooseServer(config.beastWebApiUrl) }} />
                        <C.SnowTextButton title="Vondoom" onPress={() => { chooseServer(config.vondoomWebApiUrl) }} />
                        <C.SnowTextButton title="Storm" onPress={() => { chooseServer(config.stormWebApiUrl) }} />
                    </C.SnowGrid>
                </C.View>
                <C.SnowLabel center>Or enter a custom server.</C.SnowLabel>
                <C.SnowInput
                    focusKey="password-input"
                    focusDown="submit-login"
                    onSubmit={applyCustomServer}
                    onValueChange={setCustomServer}
                    value={customServer} />
                <C.SnowTextButton
                    focusKey="submit-login"
                    title="Connect to Server"
                    onPress={applyCustomServer}
                />
            </C.View >
        )
    }


    if (users && !user) {
        let renderItem = (item) => {
            if (!item.username) {
                return null
            }
            return <C.SnowTextButton
                title={item.username}
                onPress={() => { selectUser(item) }}
            />
        }
        userList = (
            <C.View>
                <C.SnowLabel center>Select a user to login to {apiClient.webApiUrl}.</C.SnowLabel>
                <C.SnowGrid
                    focusStart
                    focusKey="users"
                    focusDown="servers"
                    items={users}
                    renderItem={renderItem}
                />
            </C.View>

        )
    }
    return (
        <C.View>
            {userList}
            {selectServer}
            {passwordForm}
            <C.SnowLabel>{errors ? 'Errors: ' + JSON.stringify(errors) : ""}</C.SnowLabel>
        </C.View>
    )
}
