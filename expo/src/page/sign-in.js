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
            apiClient.getUserList(clientOptions.deviceId).then((response) => {
                setUsers(response)
            })
        }
    }, [users, apiClient, clientOptions])

    C.React.useEffect(() => {
        if (session) {
            navPush({ path: routes.landing, func: false })
        }
    }, [session])

    if (!sessionLoaded || session) {
        return null
    }

    const selectUser = (user) => {
        signIn(user.username, 'SNOWSTREAM_EMPTY')
            .then(() => {
                navReset()
            })
            .catch((err) => {
                console.log({ err })
                if (err?.message) {
                    setErrors(err.message)
                } else {
                    setErrors(C.Snow.stringifySafe(err))
                }
            })
    }

    const chooseServer = (serverUrl) => {
        setUsers(null)
        setWebApiUrl(serverUrl)
    }

    let userList = null
    let selectServer = null
    if (users?.length) {
        let renderItem = (item) => {
            if (!item.username) {
                return null
            }
            if (item.has_password) {
                return (
                    <C.SnowTextButton
                        title={item.username}
                        onPress={navPush({
                            path: routes.enterPassword,
                            params: {
                                username: item.username
                            }
                        })}
                    />
                )
            }
            return (
                <C.SnowTextButton
                    title={item.username}
                    onPress={() => { selectUser(item) }}
                />
            )
        }
        userList = (
            <C.SnowView yy={1}>
                <C.SnowLabel center>Select a user to login to {apiClient.webApiUrl}.</C.SnowLabel>
                <C.SnowGrid
                    focusStart
                    focusKey="users"
                    items={users}
                    renderItem={renderItem}
                />
            </C.SnowView>

        )
    }
    selectServer = (
        <C.SnowView yy={2}>
            <C.SnowLabel center>Choose a server to use.</C.SnowLabel>
            <C.SnowGrid
                focusStart={!!users ? false : true}
                focusKey="servers"
                itemsPerRow={4} >
                <C.SnowTextButton selected={apiClient?.webApiUrl === config.beastWebApiUrl} title="Beast" onPress={() => { chooseServer(config.beastWebApiUrl) }} />
                <C.SnowTextButton selected={apiClient?.webApiUrl === config.vondoomWebApiUrl} title="Vondoom" onPress={() => { chooseServer(config.vondoomWebApiUrl) }} />
                <C.SnowTextButton selected={apiClient?.webApiUrl === config.stormWebApiUrl} title="Storm" onPress={() => { chooseServer(config.stormWebApiUrl) }} />
            </C.SnowGrid>
            <C.SnowLabel center>Or enter a custom server.</C.SnowLabel>
            <C.SnowGrid itemsPerRow={2} assignFocus={false}>
                <C.SnowInput
                    focusKey="custom-server-input"
                    onSubmit={() => { chooseServer(customServerRef.current) }}
                    onValueChange={setCustomServer}
                    value={customServer} />
            </C.SnowGrid>
            <C.SnowGrid itemsPerRow={2} assignFocus={false}>
                <C.SnowTextButton
                    focusKey="submit-custom-server"
                    title="Connect to Server"
                    onPress={() => { chooseServer(customServerRef.current) }}
                />
            </C.SnowGrid >
        </C.SnowView>
    )



    return (
        <>
            {userList}
            {selectServer}
            {errors ? <C.SnowLabel>{errors}</C.SnowLabel> : null}
        </>
    )
}
