import { View } from 'react-native'
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

export default function PageLoader() {
    return (
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
    )
}
