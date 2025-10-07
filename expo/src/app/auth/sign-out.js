import { C } from 'snowstream'

export default function SignOutPage() {
    const { signOut } = C.useAppContext();
    const { routes } = C.useAppContext();
    const [signedOut, setSignedOut] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!signedOut) {
            signOut()
            setSignedOut(true)
            routes.reset()
        }
    })

    return (
        <C.View>
            <C.Text>Signing out...</C.Text>
        </C.View>
    );
}
