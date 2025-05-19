import C from './common'
import { SessionProvider } from './auth-context'
import { SettingsProvider } from './settings-context'
import { MessageDisplayProvider } from './message-context'
import * as NavigationBar from 'expo-navigation-bar'

const styles = {
    default: {
        backgroundColor: '#000000',
    },
    safeArea: {
        padding: 10,
        backgroundColor: '#000000',
        flex: 1
    },
    header: {
        marginBottom: 10,
    },
    footer: {

    },
    page: {
        flex: 1
    },
    scroll: {
        height: '65%',
        width: '100%'
    }
}

function Header() {
    const { isAdmin, displayName } = C.useSession()
    const { routes } = C.useSettings()

    if (!displayName) {
        return ''
    }

    const renderItem = (item) => {
        const entry = item
        return <C.SnowTextButton title={entry.title} onPress={routes.func(entry.route)} />
    }
    const buttons = [
        { title: 'Home', route: routes.landing },
        { title: 'Options', route: routes.options },
        { title: 'Sign Out', route: routes.signOut },
    ]
    if (isAdmin) {
        buttons.push({ title: 'Admin', route: routes.admin.dashboard })
    }
    return (
        <C.View style={styles.header}>
            <C.SnowGrid items={buttons} renderItem={renderItem}></C.SnowGrid>
        </C.View>
    )
}

function Footer() {
    const { config } = C.useSettings()
    const { displayName } = C.useSession()
    let authedInfo = 'Not logged in.'
    if (displayName) {
        authedInfo = `Logged in as [${displayName}]`
    }
    return (
        <C.View style={styles.footer}>
            <C.Text>{'\n'}</C.Text>
            <C.SnowText>
                Client v{config.clientVersion} talking to server at [{config.webApiUrl}] - {authedInfo}
            </C.SnowText>
        </C.View>
    )
}

// style overrides
if (C.Platform.OS === 'android') {
    if (C.Platform.isTV) {

    }
    else {

    }
}

// TODO Do I want always visible nav bars, or some kind of drawer?
function SafeAreaStub(props) {
    return <C.View style={styles.safeArea}>{props.children}</C.View>
}

function MessageDisplay() {
    // This is mainly a debugging helper.
    // Not sure if there's any reason to keep it in the deployed app
    return null
    const { message } = C.useMessageDisplay()
    return <C.SnowText style={{ width: C.getWindowWidth() }}>Message: {message}</C.SnowText>
}

export default function RootLayout() {
    let PlatformWrapper = null
    if (C.Platform.OS === 'web') {
        PlatformWrapper = (props) => {
            return (
                <SafeAreaStub>
                    {props.children}
                </SafeAreaStub>
            )
        }
    } else {
        PlatformWrapper = (props) => {
            let safeArea = require('react-native-safe-area-context')
            let SafeAreaProvider = safeArea.SafeAreaProvider
            let SafeAreaView = safeArea.SafeAreaView
            return (
                <SafeAreaProvider style={[styles.default, styles.page]}>
                    <SafeAreaView style={styles.page}>
                        <C.TVFocusGuideView style={styles.page}>
                            {props.children}
                        </C.TVFocusGuideView>
                    </SafeAreaView>
                </SafeAreaProvider>
            )
        }
    }

    if (C.Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden')
    }


    return (
        <PlatformWrapper>
            <SettingsProvider>
                <SessionProvider>
                    <MessageDisplayProvider>
                        <C.View styles={styles.page}>
                            <Header />
                            <MessageDisplay />
                            <C.ScrollView style={styles.scroll}>
                                <C.Slot style={styles.page} />
                            </C.ScrollView>
                            <Footer />
                        </C.View>
                    </MessageDisplayProvider>
                </SessionProvider>
            </SettingsProvider>
        </PlatformWrapper>
    )
}
