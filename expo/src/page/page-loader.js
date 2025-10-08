import { View } from 'react-native'
import Snow from 'expo-snowui'
import { AppContextProvider, config, useAppContext } from 'snowstream'
import { Pages } from '../pages'
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

function CurrentPage(props) {
    const { currentRoute, routes } = useAppContext()
    if (currentRoute.route === routes.signIn || currentRoute.route === '/') {
        const Page = Pages[routes.signIn]
        return <Page />
    }
    return <AuthPageLoader />
}

export default function PageLoader() {
    return (
        // You need this outer view, or else the screen flashes white on first load
        <View style={{ flex: 1, backgroundColor: appStyle.color.background }}>
            <Snow.App DEBUG_FOCUS={config.debugFocus} snowStyle={appStyle}>
                <AppContextProvider>
                    <CurrentPage />
                </AppContextProvider >
            </Snow.App >
        </View >
    )
}
