import C from '../../common'

const styles = {
    fill: {
        flex: 1,
        backgroundColor: 'black'
    }
}

export default function AuthPageLayout() {
    const { session, isLoading } = C.useSession();
    const { routes } = C.useSettings();

    if (isLoading) {
        return <C.Text>Loading...</C.Text>;
    }

    if (!session) {
        return <C.Redirect href={routes.signIn} />;
    }

    return (
        <C.View style={styles.fill}>
            <C.Slot style={styles.fill} />
        </C.View>
    )
}
