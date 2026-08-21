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
        background: '#000000',
        text: '#ebebeb',
        textDark: '#161616',
        active: '#969696',
        hover: '#778bff',
        hoverDark: '#5361b1',
        core: '#db9e2c',
        coreDark: '#88621b',
        outlineDark: '#3f3f3f',
        fade: '#171717',
        transparentDark: '#00000099',
        panel: '#323232'
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
            DEBUG_FOCUS={!!config.debugFocus}
            DEBUG_FOCUS_TREE={config.debugFocus === 'verbose'}
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
