import C from './common'

import { ThemeProvider, createTheme } from '@rneui/themed'
import { SessionProvider } from './auth-context'
import { SettingsProvider } from './settings-context'

const routes = require('./routes')

// https://reactnativeelements.com/docs/customization/theme_object
const theme = createTheme({
    lightColors: {
        primary: '#db9e2c',
        background: '#000000',
    },
    darkColors: {
        primary: '#db9e2c',
        background: '#000000',
    },
    mode: 'dark',
})

var styles = C.StyleSheet.create({
    default: {
        backgroundColor: '#000000',
    },
    // This needs to be slightly larger than the offset in play.js for the videoview
    // I don't know why, but without gap the surfaceview doesn't clean up.
    // It leaves the screen blank after hitting back on a video on Android TV
    videoSqueeze: {
        margin: 10,
    },
    safeArea: {
        padding: 10,
        backgroundColor: '#000000',
        height: '100%',
        width: '100%',
    },
    header: {
        marginBottom: 10,
    },
})

function Header() {
    const { isAdmin, displayName } = C.useSession()
    const { routes } = C.useSettings()

    if (!displayName) {
        return ''
    }

    const renderItem = (item) => {
        const entry = item
        return <C.Button title={entry.title} onPress={routes.func(entry.route)} />
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
            <C.SnowGrid short={true} data={buttons} renderItem={renderItem}></C.SnowGrid>
        </C.View>
    )
}

function Footer() {
    const { routes, config } = C.useSettings()
    const { displayName } = C.useSession()
    let authedInfo = 'Not logged in.'
    if (displayName) {
        authedInfo = `Logged in as [${displayName}]`
    }
    return (
        <>
            <C.Text>{'\n'}</C.Text>
            <C.SnowText>Using server at [{config.webApiUrl}] - {authedInfo}</C.SnowText>
        </>
    )
}

// TODO Do I want always visible nav bars, or some kind of drawer?

function SafeAreaStub(props) {
    return <C.View style={styles.safeArea}>{props.children}</C.View>
}

export default function RootLayout() {
    if (C.Platform.OS === 'web') {
        return (
            <ThemeProvider theme={theme}>
                <SafeAreaStub>
                    <SettingsProvider>
                        <SessionProvider>
                            <C.View style={styles.videoSqueeze}>
                                <Header />
                                <C.ScrollView>
                                    <C.Slot />
                                </C.ScrollView>
                                <Footer />
                            </C.View>
                        </SessionProvider>
                    </SettingsProvider>
                </SafeAreaStub>
            </ThemeProvider>
        )
    }
    let safeArea = require('react-native-safe-area-context')
    let SafeAreaProvider = safeArea.SafeAreaProvider
    let SafeAreaView = safeArea.SafeAreaView
    return (
        <ThemeProvider theme={theme}>
            <SafeAreaProvider style={styles.default}>
                <SafeAreaView>
                    <C.TVFocusGuideView autoFocus>
                        <SettingsProvider>
                            <SessionProvider>
                                <View style={styles.videoSqueeze}>
                                    <Header />
                                    <C.ScrollView>
                                        <C.Slot />
                                    </C.ScrollView>
                                    <Footer />
                                </View>
                            </SessionProvider>
                        </SettingsProvider>
                    </C.TVFocusGuideView>
                </SafeAreaView>
            </SafeAreaProvider>
        </ThemeProvider>
    )
}
