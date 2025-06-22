import C from '../../common'


export default function AuthPageLayout() {
    const { isLoading, routes, session } = C.useAppContext();

    if (isLoading) {
        return <C.Text>Loading...</C.Text>;
    }

    if (!session) {
        return <C.Redirect href={routes.signIn} />;
    }

    return (
        <C.Slot />
    )
}
