import C from '../../common'

export default function SignOutPage() {
    const { signOut } = C.useSession();
    const { routes } = C.useSettings();
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
