import C from '../../common'

const styles = {
    fill: {
        height: C.getWindowHeight()
    }
}

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
            <C.Slot style={styles.fill} />
        </C.View>
    )
}
