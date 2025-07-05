import C from '../common'
import { AppContextProvider } from '../app-context'
import { SystemBars } from "react-native-edge-to-edge";

const styles = {
    safeArea: {
        padding: 30,
        backgroundColor: C.StaticStyle.color.background,
        flex: 1
    },
    header: {
        width: '100%'
    },
    hr: {
        borderBottomColor: C.StaticStyle.color.coreDark,
        borderBottomWidth: 2,
    },
    page: {
        flex: 1
    }
}

function SafeAreaView(props) {
    if (C.isWeb) {
        return (
            <C.View style={styles.safeArea}>
                {props.children}
            </C.View>
        )
    }
    return (
        <C.TVFocusGuideView style={styles.safeArea}>
            {props.children}
        </C.TVFocusGuideView>
    )
}

function Header() {
    const { isAdmin, displayName, routes } = C.useAppContext()

    if (!displayName) {
        return ''
    }
    return (
        <C.View style={styles.header}>
            <C.SnowGrid>
                <C.SnowTextButton title="Home" onPress={routes.func(routes.landing)} />
                <C.SnowTextButton title="Sign Out" onPress={routes.func(routes.signOut)} />
                {isAdmin ? <C.SnowTextButton title="Admin" onPress={routes.func(routes.admin.dashboard)} /> : null}
                <C.SnowTextButton title={`Info [${displayName}]`} onPress={routes.func(routes.info)} />
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
    if (C.isAndroid) {
        SystemBars.setHidden(true)
    }
    return (
        <SafeAreaView>
            <AppContextProvider>
                <C.View style={styles.page}>
                    <Header />
                    <C.Slot />
                </C.View>
            </AppContextProvider>
        </SafeAreaView>
    )
}
