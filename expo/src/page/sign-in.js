import { C, useAppContext } from 'snowstream'

// This is the default expo-router route '/'
export default function SignInPage() {
    const {
        navReset,
        navPush,
        pushModal,
        popModal
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
    const [password, setPassword] = C.React.useState("")
    const passwordRef = C.React.useRef(password)
    const [customServer, setCustomServer] = C.React.useState('')
    const customServerRef = C.React.useRef(password)

    C.React.useEffect(() => {
        customServerRef.current = customServer
    }, [customServer])

    C.React.useEffect(() => {
        passwordRef.current = password
    }, [password])

    C.React.useEffect(() => {
        if (!users?.length && apiClient && clientOptions) {
            apiClient.getUserList(clientOptions.deviceProfile).then((response) => {
                setUsers(response)
            })
        }
    }, [users, apiClient, clientOptions])

    C.React.useEffect(() => {
        if (session) {
            navPush(routes.landing)
        }
    }, [session])

    const cancelPassword = () => {
        setPassword('')
        setUser(null)
    }

    const login = () => {
        signIn(user?.username, passwordRef.current)
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

    C.React.useEffect(() => {
        if (user?.has_password) {
            pushModal({
                props: {
                    focusLayer: "enter-password",
                    onRequestClose: cancelPassword
                },
                render: () => {
                    return (
                        <>
                            <C.SnowLabel>Enter the password for {user.username}</C.SnowLabel>
                            <C.SnowInput
                                focusStart
                                focusKey="password"
                                focusDown="login"
                                onSubmit={login}
                                onValueChange={setPassword}
                                value={password}
                            />
                            <C.SnowGrid focusKey="login" itemsPerRow={2} >
                                <C.SnowTextButton title="Login" onPress={login} />
                                <C.SnowTextButton title="Cancel" onPress={cancelPassword} />
                            </C.SnowGrid>
                        </>
                    )
                }

            })
            return () => {
                popModal()
            }
        }
    }, [user, password])

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


    const chooseServer = (serverUrl) => {
        setUsers(null)
        setWebApiUrl(serverUrl)
    }


    const applyCustomServer = (target) => {
        setWebApiUrl(target)
        setUsers(null)
    }

    let passwordForm = null
    let userList = null
    let selectServer = null
    if (users?.length) {
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
            <>
                <C.SnowLabel center>Select a user to login to {apiClient.webApiUrl}.</C.SnowLabel>
                <C.SnowGrid
                    focusStart
                    focusKey="users"
                    focusDown="servers"
                    items={users}
                    renderItem={renderItem}
                />
            </>

        )
    }
    selectServer = (
        <>
            <>
                <C.SnowLabel center>Choose a server to use.</C.SnowLabel>
                <C.SnowGrid
                    focusStart={!!users ? false : true}
                    focusKey="servers"
                    focusDown="custom-server-input"
                    itemsPerRow={4} >
                    <C.SnowTextButton title="Beast" onPress={() => { chooseServer(config.beastWebApiUrl) }} />
                    <C.SnowTextButton title="Vondoom" onPress={() => { chooseServer(config.vondoomWebApiUrl) }} />
                    <C.SnowTextButton title="Storm" onPress={() => { chooseServer(config.stormWebApiUrl) }} />
                </C.SnowGrid>
            </>
            <C.SnowLabel center>Or enter a custom server.</C.SnowLabel>
            <C.SnowInput
                focusKey="custom-server-input"
                focusDown="submit-custom-server"
                onSubmit={() => { applyCustomServer(customServerRef.current) }}
                onValueChange={setCustomServer}
                value={customServer} />
            <C.SnowTextButton
                focusKey="submit-custom-server"
                title="Connect to Server"
                onPress={() => { applyCustomServer(customServerRef.current) }}
            />
        </>
    )



    return (
        <>
            {passwordForm}
            {userList}
            {selectServer}
            <C.SnowLabel>{errors ? 'Errors: ' + C.Snow.stringifySafe(errors) : ""}</C.SnowLabel>
        </>
    )
}
