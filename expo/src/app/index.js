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
    const [customServer, setCustomServer] = C.React.useState(null)
    const [password, setPassword] = C.React.useState("")

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
            <C.FillView>
                <C.SnowLabel>Enter the password for {user.username}</C.SnowLabel>
                <C.SnowInput
                    secureTextEntry
                    onSubmit={login}
                    shouldFocus
                    onValueChange={setPassword}
                    value={password}
                />
                <C.SnowGrid itemsPerRow={2} >
                    <C.SnowTextButton title="Login" onPress={login} />
                    <C.SnowTextButton title="Cancel" onPress={cancel} />
                </C.SnowGrid>
            </C.FillView>
        )
    } else {
        selectServer = (
            <C.FillView>
                <C.View>
                    <C.SnowLabel center>Choose a server to use.</C.SnowLabel>
                    <C.SnowGrid itemsPerRow={4} >
                        <C.SnowTextButton title="Beast" onPress={() => { chooseServer(config.beastWebApiUrl) }} />
                        <C.SnowTextButton title="Vondoom" onPress={() => { chooseServer(config.vondoomWebApiUrl) }} />
                        <C.SnowTextButton title="Storm" onPress={() => { chooseServer(config.stormWebApiUrl) }} />
                    </C.SnowGrid>
                </C.View>
                <C.View>
                    <C.SnowLabel center>Or enter a custom server.</C.SnowLabel>
                    <C.SnowInput onSubmit={applyCustomServer} onValueChange={setCustomServer} value={customServer} />
                    <C.SnowTextButton title="Connect to Server" onPress={applyCustomServer} />
                </C.View>
            </C.FillView>
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
            <C.FillView>
                <C.SnowLabel center>Select a user to login to {apiClient.webApiUrl}.</C.SnowLabel>
                <C.SnowGrid items={users} renderItem={renderItem} />
            </C.FillView>

        )
    }
    return (
        <C.FillView>
            {userList}
            {selectServer}
            {passwordForm}
            <C.SnowLabel>{errors ? 'Errors: ' + JSON.stringify(errors) : ""}</C.SnowLabel>
        </C.FillView>
    )
}
