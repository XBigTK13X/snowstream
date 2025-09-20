import Snow from 'react-native-snowui'
import C from '../common'

const styles = {
    header: {
        width: '100%',
        height: 'auto'
    }
}

function Header() {
    const { isAdmin, displayName, routes } = C.useAppContext()

    if (!displayName) {
        return ''
    }
    return (
        <C.View style={styles.header}>
            <C.SnowGrid shrink>
                <C.SnowTextButton title="Home" onPress={routes.func(routes.landing)} />
                <C.SnowTextButton title="Sign Out" onPress={routes.func(routes.signOut)} />
                {isAdmin ? <C.SnowTextButton
                    title="Admin"
                    onPress={routes.func(routes.admin.dashboard)} />
                    : null}
                <C.SnowTextButton
                    title={`${displayName}`}
                    onPress={routes.func(routes.info)}
                    onLongPress={routes.func(routes.options)} />
            </C.SnowGrid>
            <C.SnowBreak />
        </C.View>
    )
}

const appStyle = {
    color: {
        background: 'black',
        text: 'rgb(235, 235, 235)',
        textDark: 'rgb(22, 22, 22)',
        active: 'rgb(150, 150, 150)',
        hover: 'rgb(119, 139, 255)',
        core: 'rgb(219, 158, 44)',
        coreDark: 'rgb(136, 98, 27)',
        outlineDark: 'rgb(63, 63, 63)',
        fade: 'rgb(23, 23, 23)',
        transparentDark: 'rgba(0,0,0,0.6)'
    },
}

export default function RootLayout() {
    return (
        <Snow.App snowStyle={appStyle}>
            <C.AppContextProvider>
                <Header />
                <C.Slot />
            </C.AppContextProvider >
        </Snow.App>
    )
}
