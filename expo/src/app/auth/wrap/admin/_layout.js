import { C, useAppContext } from 'snowstream'

export default function AdminPageLayout() {
    const { isAdmin, isLoading, routes } = useAppContext();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isAdmin) {
        return <C.Redirect href={routes.landing} />;
    }

    return <C.Slot />;
}
