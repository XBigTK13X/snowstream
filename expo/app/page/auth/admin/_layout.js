import C from '../../../common'

export default function AdminPageLayout() {
    const { isAdmin, isLoading } = C.useSession();
    const { routes } = C.useSettings();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isAdmin) {
        return <C.Redirect href={routes.landing} />;
    }

    return <C.Slot />;
}
