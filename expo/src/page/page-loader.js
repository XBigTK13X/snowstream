import React from 'react'
import { View, Text, Button } from 'react-native'
import * as Sentry from "@sentry/react-native";
import * as Updates from 'expo-updates'
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
    React.useEffect(() => {
        if (!currentRoute.routePath.includes('/play/')) {
            Player.action.reset()
        }
    }, [currentRoute.routePath])
    if (currentRoute.routePath === routes.signIn || currentRoute.routePath === '/') {
        return <CurrentPage />
    }
    return <AuthPageLoader />
}

function CrashScreen(props) {
    const reload = () => {
        Updates.reloadAsync()
    }
    return (
        <View style={{ flex: 1, backgroundColor: 'black', color: 'white' }}>
            <Text>snowstream crashed due to an unhandled error.</Text>
            <Text>The problem has been logged.</Text>
            <Button title="Reload" onPress={reload} />
        </View>
    )
}

export default function PageLoader() {
    return (
        <Sentry.ErrorBoundary
            fallback={<CrashScreen />}
            onError={(error, componentStack) => {
                console.error('Unhandled error:', error)
                if (componentStack) {
                    console.error('Component stack:', componentStack)
                }
                Sentry.captureException(error)
            }}>
            <Snow.App
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
        </Sentry.ErrorBoundary>
    )
}
