import { C, useAppContext } from 'snowstream'


export default function AuthPageLayout() {
    const { isLoading, routes, session } = useAppContext();

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
