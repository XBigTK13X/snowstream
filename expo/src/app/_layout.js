import C from '../common'

const styles = {
    header: {
        width: '100%',
        height: 'auto'
    },
    hr: {
        borderBottomColor: C.Style.color.coreDark,
        borderBottomWidth: 2,
    }
}

function Header() {
    const { isAdmin, displayName, routes } = C.useAppContext()

    if (!displayName) {
        return ''
    }
    return (
        <C.View style={styles.header}>
            <C.SnowGrid shrink>
                <C.SnowTextButton title="Home" onPress={routes.func(routes.landing)} />
                <C.SnowTextButton title="Sign Out" onPress={routes.func(routes.signOut)} />
                {isAdmin ? <C.SnowTextButton
                    title="Admin"
                    onPress={routes.func(routes.admin.dashboard)} />
                    : null}
                <C.SnowTextButton
                    title={`${displayName}`}
                    onPress={routes.func(routes.info)}
                    onLongPress={routes.func(routes.options)} />
            </C.SnowGrid>
            <C.View style={styles.hr} />
        </C.View>
    )
}

function MessageDisplay() {
    // This is mainly a debugging helper.
    // Not sure if there's any reason to keep it in the deployed app
    return null
    const { message } = C.useAppContext()
    return <C.SnowText style={{ width: C.getWindowWidth() }}>Message: {message}</C.SnowText>
}

export default function RootLayout() {
    return (
        <C.AppContextProvider>
            <C.FocusContextProvider>
                <C.ScrollView style={C.Style.page}>
                    <Header />
                    <C.Slot />
                </C.ScrollView>
            </C.FocusContextProvider>
        </C.AppContextProvider>
    )
}
