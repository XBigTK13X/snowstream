import { C, useAppContext } from 'snowstream'

export default function SignOutPage() {
    const { signOut } = useAppContext();
    const { routes } = useAppContext();
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
