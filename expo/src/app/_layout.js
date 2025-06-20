import C from '../common'
import { AppContextProvider } from '../app-context'
import * as NavigationBar from 'expo-navigation-bar'

const styles = {
    safeArea: {
        padding: 10,
        backgroundColor: '#000000',
        flex: 1
    },
    header: {
        width: '100%'
    },
    hr: {
        borderBottomColor: 'rgba(219, 158, 44, .5)',
        borderBottomWidth: 2,
    },
    page: {
        flex: 1
    }
}

function SafeAreaView(props) {
    if (C.Platform.OS === 'web') {
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
                {isAdmin ? <C.SnowTextButton title={entry.title} onPress={routes.func(routes.admin.dashboard)} /> : null}
                <C.SnowTextButton title="Info" onPress={routes.func(routes.info)} />
            </C.SnowGrid>
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
    if (C.Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden')
    }

    return (
        <SafeAreaView>
            <AppContextProvider>
                <C.View style={styles.page}>
                    <Header />
                    <C.View
                        style={styles.hr}
                    />
                    <C.Slot />
                </C.View>
            </AppContextProvider>
        </SafeAreaView>
    )
}
