import { C, useAppContext } from 'snowstream'

// This is the default expo-router route '/'
export default function SignInPage() {
    const {
        navReset,
        navPush
    } = C.useSnowContext()
    const {
        sessionLoaded,
        session,
        routes,
        setWebApiUrl,
        apiClient,
        signIn,
        config,
        clientOptions
    } = useAppContext()

    const [errors, setErrors] = C.React.useState(null)
    const [users, setUsers] = C.React.useState(null)
    const [user, setUser] = C.React.useState(null)
    const userRef = C.React.useRef(user)
    const [customServer, setCustomServer] = C.React.useState('')
    const customServerRef = C.React.useRef(customServer)
    const [password, setPassword] = C.React.useState("")
    const passwordRef = C.React.useRef(password)

    C.React.useEffect(() => {
        if (!users && apiClient && clientOptions) {
            apiClient.getUserList(clientOptions.deviceProfile).then((response) => {
                setUsers(response)
            })
        }
    }, [users, apiClient])

    C.React.useEffect(() => {
        customServerRef.current = customServer
        userRef.current = user
        passwordRef.current = password
    })

    C.React.useEffect(() => {
        if (session) {
            navPush(routes.landing)
        }
    }, [session])

    if (!sessionLoaded || session) {
        return null
    }

    const selectUser = (user) => {
        if (user.has_password) {
            setUser(user)
        }
        else {
            signIn(user.username, 'SNOWSTREAM_EMPTY')
                .then(() => {
                    navReset()
                })
                .catch((err) => {
                    setErrors(err)
                })
        }

    }

    const login = () => {
        signIn(userRef.current.username, passwordRef.current)
            .then((result) => {
                if (result.failed) {
                    setErrors("Incorrect password for this user.")
                }
                else {
                    navReset()
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
    if (user?.has_password) {
        return (
            <C.SnowModal focusLayer="enter-password" onRequestClose={cancel}>
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
            </C.SnowModal>
        )
    }
    if (users) {
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



    return (
        <C.View>
            {passwordForm}
            {userList}
            {selectServer}
            <C.SnowLabel>{errors ? 'Errors: ' + JSON.stringify(errors) : ""}</C.SnowLabel>
        </C.View>
    )
}
