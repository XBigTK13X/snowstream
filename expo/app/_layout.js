import C from './common'

import { SessionProvider } from './auth-context'
import { SettingsProvider } from './settings-context'
import { MessageDisplayProvider } from './message-context'
import * as NavigationBar from 'expo-navigation-bar'

const routes = require('./routes')


function Header(props) {
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
        <C.View style={props.styles.header}>
            <C.SnowGrid items={buttons} renderItem={renderItem}></C.SnowGrid>
        </C.View>
    )
}

function Footer(props) {
    const { routes, config } = C.useSettings()
    const { displayName } = C.useSession()
    let authedInfo = 'Not logged in.'
    if (displayName) {
        authedInfo = `Logged in as [${displayName}]`
    }
    return (
        <>
            <C.Text>{'\n'}</C.Text>
            <C.SnowText>
                Client v{config.clientVersion} talking to server at [{config.webApiUrl}] - {authedInfo}
            </C.SnowText>
        </>
    )
}

function MessageDisplay() {
    // This is mainly a debugging helper.
    // Not sure if there's any reason to keep it in the deployed app
    const { message } = C.useMessageDisplay()
    return null
    return <C.SnowText>Message: {message}</C.SnowText>
}

// TODO Do I want always visible nav bars, or some kind of drawer?
function SafeAreaStub(props) {
    return <C.View style={[props.styles.safeArea, props.styles.page]}>{props.children}</C.View>
}

export default function RootLayout() {
    var styles = {
        default: {
            backgroundColor: '#000000',
        },
        safeArea: {
            padding: 10,
            backgroundColor: '#000000',
            height: C.getWindowHeight(),
            width: '100%',
        },
        header: {
            marginBottom: 10,
        },
        page: {
            height: C.getWindowHeight(),
            width: '100%'
        },
        scroll: {
            height: C.getWindowHeight() - 300,
            width: '100%'
        }
    }
    let PlatformWrapper = null
    if (C.Platform.OS === 'web') {
        PlatformWrapper = (props) => {
            return (
                <SafeAreaStub styles={styles}>
                    <C.View>{props.children}</C.View>
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
                        <C.TVFocusGuideView>{props.children}</C.TVFocusGuideView>
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
                            <Header styles={styles} />
                            <MessageDisplay />
                            <C.ScrollView style={styles.scroll}>
                                <C.Slot />
                            </C.ScrollView>
                            <Footer styles={styles} />
                        </C.View>
                    </MessageDisplayProvider>
                </SessionProvider>
            </SettingsProvider>
        </PlatformWrapper>
    )
}
