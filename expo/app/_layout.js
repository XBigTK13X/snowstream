import { Redirect, Slot } from 'expo-router'
import { Text, TVFocusGuideView, View, StyleSheet, Platform } from 'react-native'
import { ThemeProvider, createTheme } from '@rneui/themed'
import { SessionProvider } from './auth-context'
import { SettingsProvider } from './settings-context'
import { Button, ListItem } from '@rneui/themed'
import { SimpleGrid } from 'react-native-super-grid'

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

var styles = StyleSheet.create({
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
        backgroundColor: "#000000",
        height: '100%',
        width: '100%'
    }
})

function Header() {
    const renderItem = (item) => {
        const entry = item.item
        return <Button title={entry.title} onPress={routes.func(entry.route)} />
    }
    const buttons = [
        { title: 'Home', route: routes.landing },
        { title: 'Options', route: routes.options },
        { title: 'Sign Out', route: routes.signOut },
    ]
    return <SimpleGrid data={buttons} renderItem={renderItem}></SimpleGrid>
}

function Footer() {
    return (
        <>
            <Text>{'\n'}</Text>
            <Text></Text>
        </>
    )
}

// TODO Do I want always visible nav bars, or some kind of drawer?

function SafeAreaStub(props) {
    return <View style={styles.safeArea}>
        {props.children}
    </View>
}

export default function HomeLayout() {
    console.log(Platform.OS)
    if (Platform.OS === 'web') {
        return (
            <ThemeProvider theme={theme}>
                <SafeAreaStub>
                    <SettingsProvider>
                        <SessionProvider>
                            <View style={styles.videoSqueeze}>
                                <Header />
                                <Slot />
                                <Footer />
                            </View>
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
                    <TVFocusGuideView autoFocus>
                        <SettingsProvider>
                            <SessionProvider>
                                <View style={styles.videoSqueeze}>
                                    <Header />
                                    <Slot />
                                    <Footer />
                                </View>
                            </SessionProvider>
                        </SettingsProvider>
                    </TVFocusGuideView>
                </SafeAreaView>
            </SafeAreaProvider>
        </ThemeProvider>
    )
}
