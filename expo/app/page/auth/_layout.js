import C from '../../common'

export default function AuthPageLayout() {
    const { session, isLoading, displayName } = C.useSession();
    const { routes } = C.useSettings();

    if (isLoading) {
        return <C.Text>Loading...</C.Text>;
    }

    if (!session) {
        return <C.Redirect href={routes.signIn} />;
    }

    return (
        <C.View>
            <C.Slot />
        </C.View>
    )
}
