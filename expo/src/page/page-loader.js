import pkg from "../../package.json";
import React from 'react'
import { View, Platform } from 'react-native'
import Snow from 'expo-snowui'
import {
    config,
    AppContextProvider,
    useAppContext,
} from 'snowstream'
import Player from 'snowstream-player'
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

const SnowApp = Snow.createSnowApp({
    enableSentry: true,
    sentryUrl: "https://e347f7f6238e44238666aef85b8a1b15@bugsink.9914.us/1",
    appName: "snowstream",
    appVersion: pkg.version
})

function PageWrapper(props) {
    const { routes } = useAppContext()
    const { CurrentPage, currentRoute, SnowStyle } = Snow.useSnowContext(props)
    let appWrapperStyle = { flex: 1, paddingBottom: 50 }
    if (SnowStyle.isPortrait) {
        appWrapperStyle.paddingTop = 50
    }

    let interior = null
    if (currentRoute.routePath === routes.signIn || currentRoute.routePath === '/') {
        interior = <CurrentPage />
    } else {
        interior = <AuthPageLoader />
    }
    return (
        <Snow.View style={appWrapperStyle}>
            {interior}
        </Snow.View>
    )
}

export default function PageLoader() {

    return (
        <SnowApp
            DEBUG_SNOW={config.debugSnowui}
            DEBUG_NAVIGATION={false}
            DEBUG_FOCUS={false}
            DEBUG_FOCUS_TREE={false}
            snowStyle={appStyle}
            routePaths={routes}
            routePages={pages}
            initialRoutePath={routes.signIn}
        >
            <AppContextProvider>
                <Player.Manager>
                    <PageWrapper />
                </Player.Manager>
            </AppContextProvider >
        </SnowApp>
    )
}
