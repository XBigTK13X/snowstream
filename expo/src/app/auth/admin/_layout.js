import C from '../../../common'

export default function AdminPageLayout() {
    const { isAdmin, isLoading } = C.useAppContext();
    const { routes } = C.useAppContext();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isAdmin) {
        return <C.Redirect href={routes.landing} />;
    }

    return <C.Slot />;
}
