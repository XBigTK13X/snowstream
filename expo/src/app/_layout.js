import C from '../common'
import { AppContextProvider } from '../app-context'
import * as NavigationBar from 'expo-navigation-bar'
import { routes } from '../routes'

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
    const { isAdmin, displayName, routes } = C.useAppContext()

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

// style overrides
if (C.Platform.OS === 'android') {
    if (C.Platform.isTV) {

    }
    else {

    }
}


function Footer() {
    const { displayName, config } = C.useAppContext()
    let authedInfo = 'Not logged in.'
    if (displayName) {
        authedInfo = `Logged in as [${displayName}]`
    }
    return (
        <C.View style={styles.footer}>
            <C.Text>{'\n'}</C.Text>
            <C.SnowText>
                snowstream client v{config.clientVersion} talking to server at [{config.webApiUrl}] - {authedInfo}
            </C.SnowText>
        </C.View>
    )
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

    let scrollStyle = [styles.scroll]
    if (C.Platform.OS === 'web') {
        scrollStyle.push({ height: C.getWindowHeight() - 300 })
    }

    return (
        <SafeAreaView>
            <AppContextProvider>
                <C.View styles={styles.page}>
                    <Header />
                    <MessageDisplay />
                    <C.ScrollView style={scrollStyle}>
                        <C.Slot style={styles.page} />
                    </C.ScrollView>
                    <Footer />
                </C.View>
            </AppContextProvider>
        </SafeAreaView>
    )
}
