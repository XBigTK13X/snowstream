import { C, useAppContext } from 'snowstream'

// This is the default expo-router route '/'
export default function SignInPage() {
    const {
        navReset,
        navPush,
        navPop,
        currentRoute
    } = C.useSnowContext()
    const {
        session,
        routes,
        signIn,
    } = useAppContext()

    const { username } = currentRoute?.routeParams?.username

    const [errors, setErrors] = C.React.useState(null)
    const [password, setPassword] = C.React.useState("")
    const passwordRef = C.React.useRef(password)


    C.React.useEffect(() => {
        if (session) {
            navPush({ path: routes.landing, func: false })
        }
    }, [session])

    C.React.useEffect(() => {
        passwordRef.current = password
    }, [password])

    const cancelPassword = () => {
        navPop()
    }

    const login = () => {
        signIn(username, passwordRef.current)
            .then((result) => {
                if (result.failed) {
                    setErrors({ 'message': `Incorrect password [${passwordRef.current}] for [${username}].` })
                }
                else {
                    clearFocusLayers()
                    navReset()
                }
            })
            .catch((err) => {
                setErrors(err)
            })
    }

    return (
        <>
            <C.SnowGrid itemsPerRow={1} assignFocus={false}>
                <C.SnowLabel center>Enter the password for {username}</C.SnowLabel>

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
                <C.SnowLabel>{errors ? 'Errors: ' + C.Snow.stringifySafe(errors) : ""}</C.SnowLabel>
            </C.SnowGrid>
        </>
    )
}
