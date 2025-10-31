import React from 'react'
import { View, Text, Button } from 'react-native'
import * as Sentry from "@sentry/react-native";
import { ToastProvider } from 'expo-toast';
import Snow from 'expo-snowui'
import {
    config,
    AppContextProvider,
    useAppContext,
} from 'snowstream'
import { Player } from 'snowstream'
import { routes } from '../routes'
import { pages } from '../pages'
import AuthPageLoader from './auth/auth-page-loader'

const appStyle = {
    color: {
        background: 'black',
        text: 'rgb(235, 235, 235)',
        textDark: 'rgb(22, 22, 22)',
        active: 'rgb(150, 150, 150)',
        hover: 'rgb(119, 139, 255)',
        hoverDark: 'rgba(83, 97, 177, 1)',
        core: 'rgb(219, 158, 44)',
        coreDark: 'rgb(136, 98, 27)',
        outlineDark: 'rgb(63, 63, 63)',
        fade: 'rgb(23, 23, 23)',
        transparentDark: 'rgba(0,0,0,0.6)',
        panel: 'rgb(50,50,50)'
    }
}

function PageWrapper() {
    const { CurrentPage, currentRoute } = Snow.useSnowContext()
    const { routes } = useAppContext()
    if (currentRoute.routePath === routes.signIn || currentRoute.routePath === '/') {
        return <CurrentPage />
    }
    return <AuthPageLoader />
}

function CrashScreen(props) {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 60, backgroundColor: 'black', color: 'white' }}>
            <Text style={{ fontSize: 40, margin: 20, color: 'white' }}>snowstream crashed due to an unhandled error.</Text>
            <Text style={{ fontSize: 40, margin: 20, color: 'white' }}>The problem has been logged.</Text>
            <View style={{ width: 400, margin: 20 }}>
                <Button title="Reload" onPress={props.reloadApp} />
            </View>
        </View>
    )
}

export default function PageLoader() {
    const [appKey, setAppKey] = React.useState(1)
    const reloadApp = () => {
        setAppKey(prev => { return prev + 1 })
    }
    return (
        <Sentry.ErrorBoundary
            fallback={<CrashScreen reloadApp={reloadApp} />}
            onError={(error, componentStack) => {
                console.error('Unhandled error:', error)
                if (componentStack) {
                    console.error('Component stack:', componentStack)
                }
                Sentry.captureException(error)
            }}>
            <ToastProvider>
                <Snow.App
                    key={appKey}
                    DEBUG_SNOW={config.debugSnowui}
                    snowStyle={appStyle}
                    routePaths={routes}
                    routePages={pages}
                    initialRoutePath={routes.signIn}
                >
                    <AppContextProvider>
                        <Player.Manager>
                            <View style={{ flex: 1, marginBottom: 50 }}>
                                <PageWrapper />
                            </View>
                        </Player.Manager>
                    </AppContextProvider >
                </Snow.App >
            </ToastProvider>
        </Sentry.ErrorBoundary>
    )
}
