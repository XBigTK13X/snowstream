import Snow from 'expo-snowui'
import C from '../common'
import { config } from '../settings'

const styles = {
    header: {
        width: '100%'
    }
}

function Header(props) {
    const { isAdmin, routes, displayName } = C.useAppContext()

    C.React.useEffect(() => {
        props.setHeaderReady(true)
    })

    return (
        <C.View style={styles.header}>
            <C.SnowGrid
                focusKey="header"
                focusDown="page-entry">
                <C.SnowTextButton
                    title="Home"
                    onPress={routes.func(routes.landing)}
                />
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
        </C.View >
    )
}

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

function InnerApp() {
    const [headerReady, setHeaderReady] = C.React.useState(false)
    const { displayName } = C.useAppContext()
    const { currentLayer } = C.useFocusContext()

    C.React.useEffect(() => {
        setHeaderReady(false)
    }, [currentLayer])

    if (!displayName) {
        return <C.Slot />
    }

    let header = null
    if (displayName) {
        header = (
            <Header setHeaderReady={setHeaderReady} />
        )
    }

    if (!headerReady) {
        return header
    }

    return (
        <C.View>
            {header}
            <C.Slot />
        </C.View>
    )
}

export default function RootLayout() {
    return (
        <Snow.App DEBUG_FOCUS={config.debugFocus} snowStyle={appStyle}>
            <C.AppContextProvider>
                <InnerApp />
            </C.AppContextProvider >
        </Snow.App >
    )
}
